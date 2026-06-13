const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('web/script.js', 'utf8');

test('stage-clear logic pauses the game loop and resets player state on new stage', () => {
  assert.match(
    source,
    /gameState = "STAGE_CLEAR";/,
    'stage clear should stop the running loop state',
  );

  assert.match(
    source,
    /body: `action=new_game&job=\$\{encodeURIComponent\(player\.job \|\| "Warrior"\)\}`/,
    'new-stage fetch should include the current job',
  );

  assert.match(
    source,
    /serverLevel = data\.player\.level \|\| 1;/,
    'level should be reset from server data on stage refresh',
  );
});
