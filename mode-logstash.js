define("ace/mode/logstash_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
  "use strict";

  var oop = require("../lib/oop");
  var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

  var LogstashHighlightRules = function() {
    this.$rules = {
      start: [{
        token: "support.class.logstash",
        regex: /^(?:input|filter|codec|output)/,
        comment: "classes: inputs, codecs, filters and outputs"
      }, {
        token: [
          "keyword.operator.logstash",
          "text.logstash",
          "text.logstash",
          "support.function.logstash",
          "text.logstash"
        ],
        regex: /(?:(and|or)(\s+)(\[)(\w*)(\]))+/,
        comment: "complex if/else if statements"
      }, {
        token: "keyword.operator.logstash",
        regex: /==|!=|<|>|<=|>=|=~|!~|in|not in|and|or|nand|xor|!/,
        comment: "Operators"
      }, {
        token: [
          "entity.name.function.logstash",
          "entity.name.function.logstash",
          "entity.name.function.logstash"
        ],
        regex: /(%{)(\w*)(})/,
        comment: "Groked Field"
      }, {
        token: "string.text.logstash",
        regex: /".+?[^"]*"/,
        comment: "String values"
      }, {
        token: "string.text.logstash",
        regex: /'.+?[^']*'/,
        comment: "String values"
      }, {
        token: [
          "keyword.control.logstash",
          "text.logstash",
          "text.logstash",
          "entity.name.function.logstash",
          "text.logstash",
          "text.logstash",
          "keyword.operator.logstash"
        ],
        regex: /(if|else if)(\s+)(\[)(\w*)(\])(\s*)(==|!=|<|>|<=|>=|=~|!~|in|not in|!)/,
        comment: "if/else if statements"
      }, {
        token: [
          "keyword.control.logstash",
          "text.logstash",
          "text.logstash"
        ],
        regex: /(else)(\s+)({)/,
        comment: "else statements"
      }, {
        token: [
          "text.logstash",
          "entity.name.function.logstash",
          "text.logstash",
          "text.logstash",
          "variable.parameter.logstash",
          "text.logstash",
          "keyword.operator.logstash",
          "text.logstash"
        ],
        regex: /^(\s*)(\w+)(\s*\{)((?:\s*)?)((?:\w+)?)((?:\s*)?)((?:=>)?)((?:\s*)?)/,
        comment: "functions: types of inputs, codecs, filters and outputs"
      }, {
        token: "comment.line.number-sign.logstash",
        regex: /^(?:\s*)?#.+/,
        comment: "Comments"
      }, {
        token: [
          "keyword.text.logstash",
          "variable.parameter.logstash",
          "keyword.text.logstash",
          "keyword.operator.logstash",
          "keyword.text.logstash",
          "string.text.logstash"
        ],
        regex: /^((?:\s*)?)(\w+)((?:\s*)?)(=>)((?:\s*)?)(\d+)/,
        comment: "Variables: Number values"
      }, {
        token: [
          "keyword.text.logstash",
          "variable.parameter.logstash",
          "keyword.text.logstash",
          "keyword.operator.logstash",
          "keyword.text.logstash",
          "string.text.logstash"
        ],
        regex: /^((?:\s*)?)(\w+)((?:\s*)?)(=>)((?:\s*)?)((?:\w*)?)/,
        comment: "Variables: String values"
      }]
    };

    this.normalizeRules();
  };

  oop.inherits(LogstashHighlightRules, TextHighlightRules);

  exports.LogstashHighlightRules = LogstashHighlightRules;
});

define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"], function(require, exports, module) {
  "use strict";

  var Range = require("../range").Range;

  var MatchingBraceOutdent = function() {};

  (function() {

    this.checkOutdent = function(line, input) {
      if (! /^\s+$/.test(line))
        return false;

      return /^\s*\}/.test(input);
    };

    this.autoOutdent = function(doc, row) {
      var line = doc.getLine(row);
      var match = line.match(/^(\s*\})/);

      if (!match) return 0;

      var column = match[1].length;
      var openBracePos = doc.findMatchingBracket({row: row, column: column});

      if (!openBracePos || openBracePos.row == row) return 0;

      var indent = this.$getIndent(doc.getLine(openBracePos.row));
      doc.replace(new Range(row, 0, row, column-1), indent);
    };

    this.$getIndent = function(line) {
      return line.match(/^\s*/)[0];
    };

  }).call(MatchingBraceOutdent.prototype);

  exports.MatchingBraceOutdent = MatchingBraceOutdent;
});

define("ace/mode/folding/coffee",["require","exports","module","ace/lib/oop","ace/mode/folding/fold_mode","ace/range"], function(require, exports, module) {
  "use strict";

  var oop = require("../../lib/oop");
  var BaseFoldMode = require("./fold_mode").FoldMode;
  var Range = require("../../range").Range;

  var FoldMode = exports.FoldMode = function() {};
  oop.inherits(FoldMode, BaseFoldMode);

  (function() {

    this.getFoldWidgetRange = function(session, foldStyle, row) {
      var range = this.indentationBlock(session, row);
      if (range)
        return range;

      var re = /\S/;
      var line = session.getLine(row);
      var startLevel = line.search(re);
      if (startLevel == -1 || line[startLevel] != "#")
        return;

      var startColumn = line.length;
      var maxRow = session.getLength();
      var startRow = row;
      var endRow = row;

      while (++row < maxRow) {
        line = session.getLine(row);
        var level = line.search(re);

        if (level == -1)
          continue;

        if (line[level] != "#")
          break;

        endRow = row;
      }

      if (endRow > startRow) {
        var endColumn = session.getLine(endRow).length;
        return new Range(startRow, startColumn, endRow, endColumn);
      }
    };
    this.getFoldWidget = function(session, foldStyle, row) {
      var line = session.getLine(row);
      var indent = line.search(/\S/);
      var next = session.getLine(row + 1);
      var prev = session.getLine(row - 1);
      var prevIndent = prev.search(/\S/);
      var nextIndent = next.search(/\S/);

      if (indent == -1) {
        session.foldWidgets[row - 1] = prevIndent!= -1 && prevIndent < nextIndent ? "start" : "";
        return "";
      }
      if (prevIndent == -1) {
        if (indent == nextIndent && line[indent] == "#" && next[indent] == "#") {
          session.foldWidgets[row - 1] = "";
          session.foldWidgets[row + 1] = "";
          return "start";
        }
      } else if (prevIndent == indent && line[indent] == "#" && prev[indent] == "#") {
        if (session.getLine(row - 2).search(/\S/) == -1) {
          session.foldWidgets[row - 1] = "start";
          session.foldWidgets[row + 1] = "";
          return "";
        }
      }

      if (prevIndent!= -1 && prevIndent < indent)
        session.foldWidgets[row - 1] = "start";
      else
        session.foldWidgets[row - 1] = "";

      if (indent < nextIndent)
        return "start";
      else
        return "";
    };

  }).call(FoldMode.prototype);

});

define("ace/mode/logstash",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/logstash_highlight_rules","ace/mode/matching_brace_outdent","ace/range","ace/mode/behaviour/cstyle","ace/mode/folding/coffee"], function(require, exports, module) {
  "use strict";

  var oop = require("../lib/oop");
  var TextMode = require("./text").Mode;
  var LogstashHighlightRules = require("./logstash_highlight_rules").LogstashHighlightRules;
  var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
  var Range = require("../range").Range;
  var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
  var FoldMode = require("./folding/coffee").FoldMode;

  var Mode = function () {
    this.HighlightRules = LogstashHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new FoldMode();
  };
  oop.inherits(Mode, TextMode);

  (function () {


    this.lineCommentStart = "#";

    this.getNextLineIndent = function (state, line, tab) {
      var indent = this.$getIndent(line);

      var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
      var tokens = tokenizedLine.tokens;

      if (tokens.length && tokens[tokens.length - 1].type == "comment") {
        return indent;
      }

      if (state == "start") {
        var match = line.match(/^.*[\{\(\[]\s*$/);
        var startingClassOrMethod = line.match(/^\s*(class|def|module)\s.*$/);
        var startingDoBlock = line.match(/.*do(\s*|\s+\|.*\|\s*)$/);
        var startingConditional = line.match(/^\s*(if|else|when)\s*/)
        if (match || startingClassOrMethod || startingDoBlock || startingConditional) {
          indent += tab;
        }
      }

      return indent;
    };

    this.checkOutdent = function (state, line, input) {
      return /^\s+(end|else)$/.test(line + input) || this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function (state, session, row) {
      var line = session.getLine(row);
      if (/}/.test(line))
        return this.$outdent.autoOutdent(session, row);
      var indent = this.$getIndent(line);
      var prevLine = session.getLine(row - 1);
      var prevIndent = this.$getIndent(prevLine);
      var tab = session.getTabString();
      if (prevIndent.length <= indent.length) {
        if (indent.slice(-tab.length) == tab)
          session.remove(new Range(row, indent.length - tab.length, row, indent.length));
      }
    };

    this.$id = "ace/mode/logstash";
  }).call(Mode.prototype);

  exports.Mode = Mode;
});
