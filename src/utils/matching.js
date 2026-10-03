function overlapCount(listA = [], listB = []) {
  const setB = new Set(listB.map(item => String(item).toLowerCase()));
  return listA.filter(item => setB.has(String(item).toLowerCase())).length;
}

export function getMatchScore(me, other) {
  const myTeach = (me?.canTeach || []).map(s => s.skill);
  const theirTeach = (other?.canTeach || []).map(s => s.skill);
  const theyTeachWhatIWant = overlapCount(me?.wantsToLearn || [], theirTeach);
  const iTeachWhatTheyWant = overlapCount(other?.wantsToLearn || [], myTeach);
  const skillScore = Math.min((theyTeachWhatIWant + iTeachWhatTheyWant) / 2, 1) * 40;
  const goalScore = Math.min(overlapCount(me?.wantsToLearn || [], other?.wantsToLearn || []), 1) * 20;
  const availabilityScore = Math.min(overlapCount(me?.availability || [], other?.availability || []), 1) * 15;
  const languageScore = Math.min(overlapCount(me?.languages || [], other?.languages || []), 1) * 10;
  const meExp = (me?.canTeach || []).some(s => s.level !== 'Beginner');
  const otherExp = (other?.canTeach || []).some(s => s.level !== 'Beginner');
  const total = Math.round(skillScore + goalScore + availabilityScore + languageScore + (meExp && otherExp ? 15 : 7));
  return { score: Math.min(total, 100), isMutualMatch: theyTeachWhatIWant > 0 && iTeachWhatTheyWant > 0, theyTeachWhatIWant, iTeachWhatTheyWant };
}
