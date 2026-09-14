/**
 * Shared Queue Engine for CareQueue Serverless Backend
 */

const PRIORITY_RANK = {
  EMERGENCY: 0,
  APPOINTMENT: 1,
  WALK_IN: 2,
  REGULAR: 3
};

const STATUSES = {
  WAITING: "WAITING",
  IN_CONSULTATION: "IN_CONSULTATION",
  COMPLETED: "COMPLETED",
  SKIPPED: "SKIPPED",
  CANCELLED: "CANCELLED"
};

/**
 * Generate the Sort Key (SK) for the DynamoDB queue entries.
 * sortKey = <priorityRank 0..3><checkedIn 1|0 inverted><joinedAtIso>#<entryId>
 * 
 * @param {Object} entry - Queue entry object
 * @returns {string} The sort key part (after DATE#<date>#Q#)
 */
function generateQueueSortKey(entry) {
  const priority = PRIORITY_RANK[entry.priority] ?? PRIORITY_RANK.REGULAR;
  
  // Checked-in inverted: 0 for true (bubbles up), 1 for false
  const checkedIn = entry.checkedIn ? "0" : "1";
  
  // Iso string naturally sorts chronologically
  const joinedAtIso = new Date(entry.joinedAt).toISOString();
  
  return `${priority}${checkedIn}${joinedAtIso}#${entry.id}`;
}

/**
 * Get the full Primary Key for a Queue entry
 */
function getQueueItemKeys(doctorId, dateStr, entry) {
  return {
    PK: `DOCTOR#${doctorId}`,
    SK: `DATE#${dateStr}#Q#${generateQueueSortKey(entry)}`
  };
}

/**
 * Validates state transition
 * @param {string} currentStatus 
 * @param {string} nextStatus 
 * @returns {boolean}
 */
function isValidTransition(currentStatus, nextStatus) {
  const transitions = {
    WAITING: ["IN_CONSULTATION", "SKIPPED", "CANCELLED"],
    IN_CONSULTATION: ["COMPLETED", "WAITING"], // WAITING is essentially a rejoin/put back
    SKIPPED: ["WAITING", "CANCELLED"], // Can be put back to waiting
    COMPLETED: [],
    CANCELLED: []
  };
  
  return transitions[currentStatus]?.includes(nextStatus) || false;
}

module.exports = {
  PRIORITY_RANK,
  STATUSES,
  generateQueueSortKey,
  getQueueItemKeys,
  isValidTransition
};
