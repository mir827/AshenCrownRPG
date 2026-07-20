export const PHASE = Object.freeze({
  MEET_ELDER: 'meet_elder',
  DEFEAT_SCOUTS: 'defeat_scouts',
  CLAIM_RELIC: 'claim_relic',
  RECRUIT: 'recruit',
  DEFEAT_BOSS: 'defeat_boss',
  COMPLETE: 'complete',
});

export function createState() {
  return { phase: PHASE.MEET_ELDER, kills: 0, relic: false, companion: false, level: 1, potions: 2 };
}

export function advance(state, event) {
  if (state.phase === PHASE.MEET_ELDER && event === 'elder') state.phase = PHASE.DEFEAT_SCOUTS;
  else if (state.phase === PHASE.DEFEAT_SCOUTS && event === 'scout') {
    state.kills += 1;
    if (state.kills >= 3) state.phase = PHASE.CLAIM_RELIC;
  } else if (state.phase === PHASE.CLAIM_RELIC && event === 'relic') {
    state.relic = true;
    state.level = 2;
    state.phase = PHASE.RECRUIT;
  } else if (state.phase === PHASE.RECRUIT && event === 'companion') {
    state.companion = true;
    state.phase = PHASE.DEFEAT_BOSS;
  } else if (state.phase === PHASE.DEFEAT_BOSS && event === 'boss') state.phase = PHASE.COMPLETE;
  return state;
}

export function questText(state) {
  return {
    [PHASE.MEET_ELDER]: '촌장 오르벤과 대화하라',
    [PHASE.DEFEAT_SCOUTS]: `점령군 정찰병을 격퇴하라 (${state.kills}/3)`,
    [PHASE.CLAIM_RELIC]: '폐허의 봉인함을 조사하라',
    [PHASE.RECRUIT]: '몰락 기사 세라를 찾아라',
    [PHASE.DEFEAT_BOSS]: '검은 관문에서 고대 병기를 파괴하라',
    [PHASE.COMPLETE]: 'CHAPTER 1 완료 — 잊힌 서약',
  }[state.phase];
}
