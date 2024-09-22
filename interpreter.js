var Interpreter = function (source, tape, pointer,
    out, awaitInput, instruction) {
  /*
   * Brainfuck Interpreter Class
   * @source: Brainfuck script
   * @tape: Tape model
   * @pointer: Pointer model
   * @out: Output callback
   * @awaitInput: Input callback
   *
   * Usage:
   *
   *    var interpreter = new Interpreter(">", tape, pointer);
   *    interpreter.next()
   *    pointer.get("index") // 1
   *
   * */
  var tokens = "<>+-.,[]^&0gl@#/*%fr";
  var jumps = [], action = 0;

  //for ! operator
  var inputBuffer = new function() {
    this.buffer = "";
    this.initialized = false;
    this.hasInput = function () {
      if (this.initialized == false) {
        this.init();
      }
      return (this.buffer.length > 0);
    };
    this.init = function() {
      for(var i = 0, pipe = false; i < source.length; i++) {
        if (pipe) {
          this.buffer += source[i];
        }

        if (source[i] == '!') {
          pipe = true;
        }	
      }
      this.initialized = true;      
    };
    this.getNext = function() {
      var c = this.buffer.charCodeAt(0);
      this.buffer = this.buffer.substring(1);
      return c;
    };
  }

  function getIbHasInput() {
    alert("yes!");
  }


  var error = function (message) {
    return {
      "name": "Error",
      "message": message
    };
  };

  this.next = function (optimize) {
    if (action >= source.length) {
      if (jumps.length === 0) throw {
        "name": "End",
        "message": "End of brainfuck script."
      };
      else {
        throw error("Mismatched parentheses.");
      }
    }

    // Skip non-code characters
    if (tokens.indexOf(source[action]) === -1) {   
      action++;
      return this.next(optimize);
    }
    var index = pointer.get("index");
    if (index < 0 || index >= tape.models.length) {
      throw error("Memory error: " + index);
    }
    instruction(action);
    var token = source[action];
    var cell = tape.models[index];
    switch (token) {
      case "<":
        pointer.left(1);
        break;

      case ">":
        pointer.right(1);
        break;

      case "-":
        cell.dec(1);
        break;

      case "+":
        cell.inc(1);
        break;

      case ",":
        awaitInput(cell);
        break;

      case ".":
        out(cell);
        break;

      case "[":
        if(optimize&&source[action+1]==="-"&&source[action+2]==="]"){
          cell.set("value",0);
        }
        if (cell.get("value") != 0) {
          jumps.push(action);
        } else {
          var loops = 1;
          while (loops > 0) {
            action++;
            if (action >= source.length) {
              throw error("Mismatched parentheses.");
            }

            if (source[action] === "]") {
              loops--;
            } else if (source[action] === "[") {
              loops++;
            }
          }
        }
        break;

      case "]":
        if (jumps.length === 0) {
          throw error("Mismatched parentheses.");
        }

        if (cell.get("value") != 0) {
          action = jumps[jumps.length - 1];
        } else {
          jumps.pop();
        }
        break; 
      case "@":
        cell.inc(tape.models[pointer.get("index")+1].attributes.value);
        break;
      case "#":
        cell.dec(tape.models[pointer.get("index")+1].attributes.value);
        break;
      case "/":
        cell.div(tape.models[pointer.get("index")+1].attributes.value);
        break;
      case "*":
        cell.mul(tape.models[pointer.get("index")+1].attributes.value);
        break;
      case "%":
        cell.mod(tape.models[pointer.get("index")+1].attributes.value);
        break;
      case "^":
        const t = (pointer.get("index") - tape.models[pointer.get("index")].attributes.value)
        pointer.right(-t);
        break;
      case "&":
        if (tape.models[pointer.get("index")].attributes.value != 0) {
          pointer.right(-(pointer.get("index") - tape.models[pointer.get("index")+1].attributes.value));
        }
        break;
      case "0":
        if (tape.models[pointer.get("index")].attributes.value == 0) {
          pointer.right(-(pointer.get("index") - tape.models[pointer.get("index")+1].attributes.value));
        }
        break;
      case "g":
        if (tape.models[pointer.get("index")].attributes.value > tape.models[pointer.get("index")-1].attributes.value) {
          pointer.right(-(pointer.get("index") - tape.models[pointer.get("index")+1].attributes.value));
        }
        break;
      case "l":
        if (tape.models[pointer.get("index")].attributes.value < tape.models[pointer.get("index")-1].attributes.value) {
           pointer.right(-(pointer.get("index") - tape.models[pointer.get("index")+1].attributes.value));
        }
      break;
      case "f":
        const n = tape.models[pointer.get("index")].attributes.value
        const floored = Math.floor(n)
        cell.inc(floored - n)
      break;

      case "r":
        cell.reset(0)
      break;

    }
    return action++;
  }
};
