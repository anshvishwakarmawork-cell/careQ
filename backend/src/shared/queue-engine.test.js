const { generateQueueSortKey, PRIORITY_RANK, isValidTransition } = require("./queue-engine");

describe("Queue Engine", () => {
  test("Priority ranking creates correct sort keys", () => {
    const entry1 = {
      id: "Q1",
      priority: "REGULAR",
      checkedIn: false,
      joinedAt: "2023-01-01T10:00:00.000Z"
    };
    const entry2 = {
      id: "Q2",
      priority: "EMERGENCY",
      checkedIn: true,
      joinedAt: "2023-01-01T10:05:00.000Z"
    };

    const sk1 = generateQueueSortKey(entry1);
    const sk2 = generateQueueSortKey(entry2);

    // SK structure: <priorityRank><checkedIn inverted><joinedAtIso>#<id>
    expect(sk1).toBe(`${PRIORITY_RANK.REGULAR}12023-01-01T10:00:00.000Z#Q1`);
    expect(sk2).toBe(`${PRIORITY_RANK.EMERGENCY}02023-01-01T10:05:00.000Z#Q2`);

    // EMERGENCY (0) < REGULAR (3), so sk2 < sk1 lexically
    expect(sk2 < sk1).toBe(true);
  });

  test("Checked-in patients have higher priority within same rank", () => {
    const entry1 = {
      id: "Q1",
      priority: "REGULAR",
      checkedIn: false,
      joinedAt: "2023-01-01T10:00:00.000Z"
    };
    const entry2 = {
      id: "Q2",
      priority: "REGULAR",
      checkedIn: true,
      joinedAt: "2023-01-01T10:05:00.000Z" // joined later
    };

    const sk1 = generateQueueSortKey(entry1);
    const sk2 = generateQueueSortKey(entry2);

    // sk2 should be less than sk1 (comes first) because it's checked in (0 vs 1)
    expect(sk2 < sk1).toBe(true);
  });

  test("State transition validation", () => {
    expect(isValidTransition("WAITING", "IN_CONSULTATION")).toBe(true);
    expect(isValidTransition("WAITING", "COMPLETED")).toBe(false);
    expect(isValidTransition("IN_CONSULTATION", "COMPLETED")).toBe(true);
  });
});
