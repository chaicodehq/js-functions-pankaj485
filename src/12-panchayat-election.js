/**
 * 🗳️ Panchayat Election System - Capstone
 *
 * Village ki panchayat election ka system bana! Yeh CAPSTONE challenge hai
 * jisme saare function concepts ek saath use honge:
 * closures, callbacks, HOF, factory, recursion, pure functions.
 *
 * Functions:
 *
 *   1. createElection(candidates)
 *      - CLOSURE: private state (votes object, registered voters set)
 *      - candidates: array of { id, name, party }
 *      - Returns object with methods:
 *
 *      registerVoter(voter)
 *        - voter: { id, name, age }
 *        - Add to private registered set. Return true.
 *        - Agar already registered or voter invalid, return false.
 *        - Agar age < 18, return false.
 *
 *      castVote(voterId, candidateId, onSuccess, onError)
 *        - CALLBACKS: call onSuccess or onError based on result
 *        - Validate: voter registered? candidate exists? already voted?
 *        - If valid: record vote, call onSuccess({ voterId, candidateId })
 *        - If invalid: call onError("reason string")
 *        - Return the callback's return value
 *
 *      getResults(sortFn)
 *        - HOF: takes optional sort comparator function
 *        - Returns array of { id, name, party, votes: count }
 *        - If sortFn provided, sort results using it
 *        - Default (no sortFn): sort by votes descending
 *
 *      getWinner()
 *        - Returns candidate object with most votes
 *        - If tie, return first candidate among tied ones
 *        - If no votes cast, return null
 *
 *   2. createVoteValidator(rules)
 *      - FACTORY: returns a validation function
 *      - rules: { minAge: 18, requiredFields: ["id", "name", "age"] }
 *      - Returned function takes a voter object and returns { valid, reason }
 *
 *   3. countVotesInRegions(regionTree)
 *      - RECURSION: count total votes in nested region structure
 *      - regionTree: { name, votes: number, subRegions: [...] }
 *      - Sum votes from this region + all subRegions (recursively)
 *      - Agar regionTree null/invalid, return 0
 *
 *   4. tallyPure(currentTally, candidateId)
 *      - PURE FUNCTION: returns NEW tally object with incremented count
 *      - currentTally: { "cand1": 5, "cand2": 3, ... }
 *      - Return new object where candidateId count is incremented by 1
 *      - MUST NOT modify currentTally
 *      - If candidateId not in tally, add it with count 1
 *
 * @example
 *   const election = createElection([
 *     { id: "C1", name: "Sarpanch Ram", party: "Janata" },
 *     { id: "C2", name: "Pradhan Sita", party: "Lok" }
 *   ]);
 *   election.registerVoter({ id: "V1", name: "Mohan", age: 25 });
 *   election.castVote("V1", "C1", r => "voted!", e => "error: " + e);
 *   // => "voted!"
 */
export function createElection(candidates) {
  const votes = {};
  const registeredVoters = new Set();

  const registerVoter = (voter) => {
    if (!voter || typeof voter !== "object") {
      return false;
    }

    const isVoterRegistered = [...registeredVoters].some(
      (_) => _.id === voter.id,
    );

    if (
      isVoterRegistered ||
      !voter.id ||
      !voter.name ||
      !voter.age ||
      voter.age < 18
    ) {
      return false;
    }

    registeredVoters.add(voter);

    return true;
  };

  const castVote = (voterId, candidateId, onSuccess, onError) => {
    const isValidVoter = [...registeredVoters].some((_) => _.id === voterId);
    const isValidCandidate = candidates.some((_) => _.id === candidateId);

    if (!isValidVoter) {
      return onError("Voter not registered");
    }

    if (!isValidCandidate) {
      return onError("Candidate does not exist");
    }

    if (votes[voterId]) {
      return onError("Voter has already voted");
    }

    votes[voterId] = candidateId;

    return onSuccess({ voterId, candidateId });
  };

  const getResults = (sortFn) => {
    if (sortFn && typeof sortFn !== "function") {
      throw new Error("sortFn must be a function");
    }

    const votesByCandidate = {};

    Object.values(votes).forEach((candidateId) => {
      votesByCandidate[candidateId] = (votesByCandidate[candidateId] || 0) + 1;
    });

    const results = candidates
      .map((candidate) => {
        return {
          id: candidate.id,
          name: candidate.name,
          party: candidate.party,
          votes: votesByCandidate[candidate.id] ?? 0,
        };
      })
      .sort((a, b) => b.votes - a.votes);

    return sortFn ? results.sort(sortFn) : results;
  };

  const getWinner = () => {
    const votesByCandidate = {};

    if (Object.keys(votes) < 1) {
      return null;
    }

    Object.values(votes).forEach((candidateId) => {
      votesByCandidate[candidateId] = (votesByCandidate[candidateId] || 0) + 1;
    });

    const winner = candidates
      .map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        party: candidate.party,
        votes: votesByCandidate[candidate.id] ?? 0,
      }))
      .sort((a, b) => b.votes - a.votes)[0];

    return winner;
  };

  return {
    registerVoter,
    castVote,
    getResults,
    getWinner,
  };
}

export function createVoteValidator(rules) {
  // Your code here

  return (voter) => {
    if (!voter || typeof voter !== "object") {
      return { valid: false, reason: "Invalid voter object" };
    }

    for (let field of rules.requiredFields) {
      if (!voter[field]) {
        return { valid: false, reason: "Missing required fields" };
      }
    }

    if (voter.age < rules.minAge) {
      return {
        valid: false,
        reason: "Voter does not meet minimum age requirement",
      };
    }

    return { valid: true, reason: "User meets all necessary requirements" };
  };
}

export function countVotesInRegions(regionTree) {
  // Your code here
  if (
    !regionTree ||
    typeof regionTree !== "object" ||
    !regionTree.votes ||
    typeof regionTree.votes !== "number"
  ) {
    return 0;
  }

  let totalVotes = regionTree.votes;

  for (const item of regionTree.subRegions) {
    totalVotes += countVotesInRegions(item);
  }

  return totalVotes;
}

export function tallyPure(currentTally, candidateId) {
  if (!currentTally || !Object.keys(currentTally)) {
    return null;
  }

  const response = { ...currentTally };

  if (response[candidateId]) {
    response[candidateId]++;
  } else {
    response[candidateId] = 1;
  }

  return response;
}
