const fs = require('fs');
const readline = require('readline');
const path = require('path');

function printSection(title, content, lines = 10) {
  console.log(`\n=== ${title} ===`);
  console.log(content.split('\n').slice(0, lines).join('\n'));
  if (content.split('\n').length > lines) console.log('...');
}

// 1. Print rules
const rulesPath = path.join(__dirname, '../Core/rules/GenRules.md');
let rules = '';
try {
  rules = fs.readFileSync(rulesPath, 'utf-8');
  printSection('ENFORCED RULES', rules, 30);
} catch (e) {
  console.error('Could not read rules file:', rulesPath);
  process.exit(1);
}

// 2. Print tasks
const tasksPath = path.join(__dirname, '../tasks.md');
if (fs.existsSync(tasksPath)) {
  const tasks = fs.readFileSync(tasksPath, 'utf-8');
  printSection('NEXT TASKS', tasks, 20);
} else {
  console.warn('No tasks.md found in project root.');
}

// 3. Prompt for confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.question('Have you read and are you following the enforced rules and current tasks? (y/N): ', (answer) => {
  rl.close();
  if (answer.trim().toLowerCase() !== 'y') {
    console.error('Commit aborted: Please review the rules and tasks before proceeding.');
    process.exit(1);
  } else {
    process.exit(0);
  }
}); 