const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const core = require('../public/core.js');

test('checked source notes reach the Evidence Pack through the actual UI script', () => {
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, {value:'', innerHTML:'', textContent:'', addEventListener(){}});
    return elements.get(id);
  };
  const checked = [{dataset:{source:'0'}}];
  const note = {value:'Authoritative source reviewed for this fictional case.'};
  const document = {
    getElementById: id => id.startsWith('[') ? null : element(id),
    querySelectorAll: selector => selector === '[data-source]:checked' ? checked : [],
    querySelector: selector => selector === '[data-note="0"]' ? note : null,
  };
  element('claim').value='Fictional request';
  element('evidence').value='Fictional source establishes the claim only.';
  element('status').value='VERIFIED RISK';
  element('decision').value='DO NOT PAY OR ENGAGE';
  const context = vm.createContext({document,window:{ScamShieldCore:core}});
  vm.runInContext(fs.readFileSync('public/app.js','utf8'),context);
  const pack = core.buildPack(vm.runInContext('values()',context));
  assert.equal(pack.sourcesChecked[0].note,note.value);
  note.value='';
  assert.throws(()=>core.buildPack(vm.runInContext('values()',context)),/authoritative source/);
});

test('Pages deployment is restricted to main and never runs for a pull request', () => {
  const workflow=fs.readFileSync('.github/workflows/pages.yml','utf8');
  assert.match(workflow,/branches: \[main\]/);
  assert.match(workflow,/deploy:\s+if: github.event_name != 'pull_request' && github.ref == 'refs\/heads\/main'/);
  assert.equal((workflow.match(/if: github.event_name != 'pull_request'/g)||[]).length,3);
});
