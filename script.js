document.addEventListener('DOMContentLoaded', function() {
    const display = document.getElementById('display');
    const paragraph = document.getElementById('para');
    const operationDisplay = document.getElementById('operationDisplay');
    const historyButton = document.getElementById('historyButton');
    const historySection = document.getElementById('historySection');
    const calculator = document.querySelector('.calculator');
    const buttons = document.querySelectorAll('.buttons button');
  
    let currentInput = '0';
    let modified = false;
    let negativeZero = false;
    let history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
    let lastOperator = '';
  
    display.value = currentInput;
  
    function saveHistoryToLocalStorage() {
      localStorage.setItem('calculatorHistory', JSON.stringify(history));
    }
  
    buttons.forEach(button => {
      button.addEventListener('click', function() {
          if (!historySection.classList.contains('extended')) {
              const value = this.textContent;
  
              if (value === '=') {
                  if (operationDisplay.textContent.trim() !== '') {
                      calculate();
                  }
              } else if (value === 'C') {
                  clear();
              } else if (value === '+/-') {
                  toggleSign();
              } else if (value === '%') {
                  calculatePercentage();
              } else if (value === '√') {
                  calculateSquareRoot();
              } else {
                  if (/[+\-*\/]/.test(value)) {
                      if (operationDisplay.textContent.trim() !== '') {
                          const lastChar = operationDisplay.textContent.trim().slice(-1);
                          if (/[+\-*\/]/.test(lastChar)) {
                              operationDisplay.textContent = operationDisplay.textContent.slice(0, -1) + value;
                              lastOperator = value;
                              return;
                          }
                      }
  
                      if (currentInput !== '0') {
                          operationDisplay.textContent = `${currentInput} ${value}`;
                          lastOperator = value;
                          currentInput = '0';
                          modified = false;
                      }
                  } else {
                      const lastChar = operationDisplay.textContent.trim().slice(-1);
                      if (lastChar === '=') {
                          clear();
                      }
  
                      if (value === '+' || value === '-' || value === '*' || value === '/') {
                          const lastChar = currentInput[currentInput.length - 1];
                          if (lastChar === '+' || lastChar === '-' || lastChar === '*' || lastChar === '/') {
                              currentInput = currentInput.slice(0, -1) + value;
                          } else {
                              currentInput += value;
                          }
                      } else if (value === '.') {
                          const lastChar = currentInput[currentInput.length - 1];
                          if (!isNaN(lastChar) && lastChar !== '.') {
                              currentInput += value;
                          } else if (isNaN(lastChar) || currentInput === '0') {
                              currentInput += '0' + value;
                          }
                      } else {
                          if (currentInput === '0' || lastChar === '=') {
                              currentInput = value;
                          } else {
                              currentInput += value;
                          }
                      }
                      display.value = currentInput;
                  }
              }
          }
  
          saveHistoryToLocalStorage();
      });
    });
  
    function evaluateExpression(expression) {
        const tokens = expression.split(' ');
        let result = parseFloat(tokens[0]);

        for (let i = 1; i < tokens.length; i += 2) {
            const operator = tokens[i];
            const operand = parseFloat(tokens[i + 1]);

            switch (operator) {
                case '+':
                    result += operand;
                    break;
                case '-':
                    result -= operand;
                    break;
                case '*':
                    result *= operand;
                    break;
                case '/':
                    if (operand !== 0) {
                        result /= operand;
                    } else {
                        return 'Error: Division by zero';
                    }
                    break;
                default:
                    return 'Error: Invalid operator';
            }
        }

        return result;
    }
  
    historyButton.addEventListener('click', function() {
      updateHistoryDisplay();
      historySection.classList.toggle('hidden');
      adjustHistorySectionHeight();
      const isHistoryVisible = !historySection.classList.contains('hidden');
      toggleButtonsClickable(!isHistoryVisible);
    });
  
    calculator.addEventListener('click', function(event) {
        if (event.target === paragraph || event.target === operationDisplay) {
            historySection.classList.add('hidden');
            toggleButtonsClickable(true);
        }
    });
  
    document.addEventListener('keypress', function(event) {
        const key = event.key;
  
        if (!historySection.classList.contains('extended')) {
            if (/[\d\+\-\*\/]/.test(key)) {
                handleInput(key);
            } else if (key === '=' || key === 'Enter') {
                calculate();
            } else if (key === '.') {
                handleInput(key);
            } else if (key === '-') {
                toggleSign();
            }
        }
    });
  
    function handleInput(input) {
      if (!historySection.classList.contains('extended')) {
          if (currentInput === '0' && !modified) {
              if (negativeZero) {
                  currentInput = '-' + input;
                  negativeZero = false;
              } else {
                  currentInput = input;
              }
          } else {
              if (/[+\-*\/]/.test(input)) {
                  calculate();
                  operationDisplay.textContent += currentInput + ' ' + input;
                  lastOperator = input;
                  currentInput = '0';
                  modified = false;
              } else {
                  if (!modified) {
                      clear();
                  }
  
                  if (currentInput === '-0' || currentInput === '0') {
                      currentInput = input;
                  } else if (currentInput === '-0.' && input === '.') {
                      return;
                  } else {
                      currentInput += input;
                  }
                  modified = true;
              }
          }
          
          if (currentInput.length > 1 && currentInput.startsWith('0') && !currentInput.startsWith('0.')) {
              currentInput = currentInput.substring(1);
          }
          
          display.value = currentInput;
      }
    }
  
    function calculatePercentage() {
      if (!historySection.classList.contains('extended')) {
          const percentage = parseFloat(currentInput) / 100;
          display.value = percentage;
          history.push({ expression: `${currentInput}%`, result: percentage });
          currentInput = percentage.toString();
      }
    }
  
    function calculateSquareRoot() {
      if (!historySection.classList.contains('extended')) {
          const squareRootValue = Math.sqrt(parseFloat(currentInput));
          const formattedSquareRootValue = Number.isInteger(squareRootValue) 
              ? squareRootValue.toString() 
              : squareRootValue.toPrecision(14);
          display.value = formattedSquareRootValue;
          history.push({ expression: `√(${currentInput})`, result: squareRootValue });
  
          if (lastOperator === '' || currentInput === '0') {
              operationDisplay.textContent = `√${currentInput}`;
          } else {
              operationDisplay.textContent = `√${currentInput} `;
          }
  
          currentInput = formattedSquareRootValue;
      }
    }
  
    function calculate() {
      if (!historySection.classList.contains('extended')) {
          const expression = `${operationDisplay.textContent} ${currentInput}`;
          const result = evaluateExpression(expression);
          try {
              let result = eval(expression);
              result = Math.round(result * 100) / 100;
              display.value = result;
              history.push({ expression: expression, result: result });
              operationDisplay.textContent += ` ${currentInput} =`;
              currentInput = result.toString();
          } catch (error) {
              display.value = 'Error';
          }
      }
    }
  
    function clear() {
        if (!historySection.classList.contains('extended')) {
            currentInput = '0';
            modified = false;
            negativeZero = false;
            operationDisplay.textContent = '';
            display.value = currentInput;
        }
    }
  
    function toggleSign() {
      if (!historySection.classList.contains('extended')) {
          if (currentInput === '0') {
              negativeZero = true;
          } else if (currentInput === '-0') {
              currentInput = '0';
              negativeZero = true;
          } else if (currentInput.charAt(0) === '-') {
              currentInput = currentInput.slice(1);
          } else {
              currentInput = '-' + currentInput;
          }
          
          if (currentInput.length > 1 && currentInput.startsWith('0') && !currentInput.startsWith('0.')) {
              currentInput = currentInput.substring(1);
          }
          display.value = currentInput;
      }
    }
  
    function deleteAllHistoryEntries() {
      history = [];
      localStorage.removeItem('calculatorHistory');
      updateHistoryDisplay();
  
      const deleteButton = document.querySelector('.delete-button');
      deleteButton.style.display = 'none';
    }
  
    function updateHistoryDisplay() {
      const modalContent = document.createElement('div');
      modalContent.className = 'history-content';
  
      if (history.length === 0) {
          const noHistoryMessage = document.createElement('p');
          noHistoryMessage.textContent = 'There is no history yet';
          modalContent.appendChild(noHistoryMessage);
      } else {
          const title = document.createElement('h3');
          title.textContent = 'History';
          modalContent.appendChild(title);
  
          const latestEntry = history[history.length - 1];
          const latestEntryDiv = document.createElement('div');
          latestEntryDiv.textContent = latestEntry.expression + ' = ' + latestEntry.result;
          latestEntryDiv.className = 'history-entry latest-entry';
          modalContent.appendChild(latestEntryDiv);
  
          for (let i = history.length - 2; i >= 0; i--) {
              const entry = history[i];
              const historyEntry = document.createElement('div');
              historyEntry.textContent = entry.expression + ' = ' + entry.result;
              historyEntry.className = 'history-entry';
              modalContent.appendChild(historyEntry);
          }
  
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete All';
          deleteButton.className = 'delete-button';
          deleteButton.classList.add('small');
          deleteButton.addEventListener('click', function() {
              deleteAllHistoryEntries();
          });
  
          modalContent.appendChild(deleteButton);
      }
  
      historySection.innerHTML = '';
      historySection.appendChild(modalContent);
    }
  
    function adjustHistorySectionHeight() {
        const calculatorHeight = calculator.offsetHeight;
        const newHeight = calculatorHeight / 2;
        historySection.style.height = newHeight + 'px';
    }
  
    function toggleButtonsClickable(enabled) {
        buttons.forEach(button => {
            button.disabled = !enabled;
        });
    }
  });