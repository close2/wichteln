// Unit tests for solver.toit: k=1, k=2, k=3, couple exclusions, validation, and template rendering.

import expect show *
import .solver as solver

test-k1-classic:
  participants := [
    solver.Participant --email="a@example.org" --name="Alice" --groups=["G1"],
    solver.Participant --email="b@example.org" --name="Bob" --groups=["G1"],
    solver.Participant --email="c@example.org" --name="Carol" --groups=["G2"],
    solver.Participant --email="d@example.org" --name="Dave" --groups=["G2"],
    solver.Participant --email="e@example.org" --name="" --groups=[],
  ]
  rules := solver.Rules --giver-group-size=1 --prevent-direct-reciprocity=true
  assigned := solver.solve participants rules
  expect-not-null assigned
  give-counts := List participants.size 0
  for r := 0; r < participants.size; r++:
    givers := assigned[r] as List
    expect-equals 1 givers.size
    g := givers[0] as int
    expect (g != r)
    give-counts[g] = give-counts[g] + 1
    // Check group exclusions
    r-groups := (participants[r] as solver.Participant).groups
    g-groups := (participants[g] as solver.Participant).groups
    r-groups.do: | tag |
      expect (not (g-groups.contains tag))
    // Check no direct reciprocity
    other-givers := assigned[g] as List
    expect (not (other-givers.contains r))

  give-counts.do: expect-equals 1 it

test-5-participants-k2-with-couple:
  // 5 participants (Alice, Bob, Carol, Dave, Eve) where Alice <-> Bob exclude each other as receivers
  // (exclude-receivers), but ARE allowed to be co-givers together, while Carol <-> Dave exclude each other
  // as co-givers (exclude-co-givers), with k=2!
  participants := [
    solver.Participant --id="cw-1" --email="alice@example.org" --name="Alice" --exclude-receivers=["cw-2"],
    solver.Participant --id="cw-2" --email="bob@example.org" --name="Bob" --exclude-receivers=["cw-1"],
    solver.Participant --id="cw-3" --email="carol@example.org" --name="Carol" --exclude-co-givers=["cw-4"],
    solver.Participant --id="cw-4" --email="dave@example.org" --name="Dave" --exclude-co-givers=["cw-3"],
    solver.Participant --id="cw-5" --email="eve@example.org" --name="Eve",
  ]
  rules := solver.Rules --giver-group-size=2 --sample-count=3
  distinct := solver.solve-distinct participants rules
  solutions := distinct["solutions"] as List
  expect (solutions.size >= 1)
  solutions.do: | sol/List |
    // Alice (0) cannot gift Bob (1), Bob (1) cannot gift Alice (0)
    expect (not ((sol[0] as List).contains 1))
    expect (not ((sol[1] as List).contains 0))
    // Carol (2) and Dave (3) can never be co-givers on the same receiver
    for r := 0; r < 5; r++:
      team := sol[r] as List
      expect (not (team.contains 2 and team.contains 3))

test-k2-engerlbengerl:
  // 9 participants with 3 couples
  participants := [
    solver.Participant --email="anna@example.org" --name="Anna" --groups=["Pair1"],
    solver.Participant --email="ben@example.org" --name="Ben" --groups=["Pair1"],
    solver.Participant --email="clara@example.org" --name="Clara" --groups=[],
    solver.Participant --email="david@example.org" --name="David" --groups=["Pair2"],
    solver.Participant --email="elena@example.org" --name="Elena" --groups=["Pair2"],
    solver.Participant --email="felix@example.org" --name="Felix" --groups=["Pair3"],
    solver.Participant --email="greta@example.org" --name="Greta" --groups=["Pair3"],
    solver.Participant --email="hugo@example.org" --name="Hugo" --groups=[],
    solver.Participant --email="iris@example.org" --name="Iris" --groups=[],
  ]
  rules := solver.Rules
      --giver-group-size=2
      --prevent-same-group-giver-receiver=true
      --prevent-same-group-co-givers=true
      --prevent-duplicate-co-giver-pairs=true
      --prevent-direct-reciprocity=true

  // Run 20 random draws to verify 100% reliability (unlike the old greedy loop).
  20.repeat:
    assigned := solver.solve participants rules
    expect-not-null assigned

    give-counts := List participants.size 0
    seen-pairs := {}

    for r := 0; r < participants.size; r++:
      givers := assigned[r] as List
      expect-equals 2 givers.size
      g1 := givers[0] as int
      g2 := givers[1] as int
      expect (g1 != g2)
      expect (g1 != r and g2 != r)

      give-counts[g1] = give-counts[g1] + 1
      give-counts[g2] = give-counts[g2] + 1

      // Check co-giver uniqueness
      lo := min g1 g2
      hi := max g1 g2
      pair-key := "$lo:$hi"
      expect (not (seen-pairs.contains pair-key))
      seen-pairs.add pair-key

      // Check group exclusions (giver-receiver and co-giver)
      rg := (participants[r] as solver.Participant).groups
      g1g := (participants[g1] as solver.Participant).groups
      g2g := (participants[g2] as solver.Participant).groups
      g1g.do: | tag |
        expect (not (rg.contains tag))
        expect (not (g2g.contains tag))
      g2g.do: | tag |
        expect (not (rg.contains tag))

      // Check no direct reciprocity
      expect (not ((assigned[g1] as List).contains r))
      expect (not ((assigned[g2] as List).contains r))

    give-counts.do: expect-equals 2 it

test-k3-team:
  participants := List 8: | i |
    solver.Participant --email="p$i@example.org" --name="" --groups=[]
  rules := solver.Rules --giver-group-size=3 --prevent-duplicate-co-giver-pairs=false
  assigned := solver.solve participants rules
  expect-not-null assigned
  give-counts := List participants.size 0
  for r := 0; r < participants.size; r++:
    givers := assigned[r] as List
    expect-equals 3 givers.size
    givers.do: | g/int |
      expect (g != r)
      give-counts[g] = give-counts[g] + 1
  give-counts.do: expect-equals 3 it

test-validation-anti-spam:
  expect (solver.is-valid-email "user+wichteln@example.org")
  expect (not (solver.is-valid-email "bad email@example.org"))
  expect (not (solver.is-valid-email "inject\r\n@example.org"))

  // Optional name is allowed
  expect (solver.is-valid-name "")
  expect (solver.is-valid-name "Alex")
  // Anti-phishing URL rejection in names
  expect (not (solver.is-valid-name "Click https://evil.example"))
  expect (not (solver.is-valid-name "Visit www.spam.biz"))
  expect (not (solver.is-valid-name "Header\nInjection"))

test-single-unique-solution-and-unsatisfiable:
  // 4 participants, k=1, with 2 couples (A-B in G1, C-D in G2) and preventDirectReciprocity=true:
  //Wait: in a 4-cycle A -> C -> B -> D -> A vs A -> D -> B -> C -> A there are 2 cycles.
  // Let's add one more group (B-C in G3) so B cannot gift C and C cannot gift B!
  // Then A can gift C or D; B can only gift D; C can only gift A; D can gift A or B.
  // Since B MUST gift D and C MUST gift A, D MUST gift B (since A is taken by C) and A MUST gift C!
  // That leaves EXACTLY 1 unique valid solution: A->C, C->B is forbidden so C->A? Wait: if C->A and A->C, that's direct reciprocity!
  // With preventDirectReciprocity=false and groups {A,B}, {C,D}, {B,C}, {A,D}:
  // Allowed directed edges: A->C, C->A, B->D, D->B (only 1 valid 1-regular assignment!).
  participants := [
    solver.Participant --email="a@example.org" --name="A" --groups=["G1", "G4"],
    solver.Participant --email="b@example.org" --name="B" --groups=["G1", "G3"],
    solver.Participant --email="c@example.org" --name="C" --groups=["G2", "G3"],
    solver.Participant --email="d@example.org" --name="D" --groups=["G2", "G4"],
  ]
  rules-unique := solver.Rules
      --giver-group-size=1
      --prevent-same-group-giver-receiver=true
      --prevent-direct-reciprocity=false
      --sample-count=3

  distinct := solver.solve-distinct participants rules-unique
  solutions := distinct["solutions"] as List
  expect-equals 1 solutions.size
  expect (distinct["exhaustedAllSolutions"] as bool)
  expect (distinct["onlyOneSolutionExists"] as bool)
  expect-equals 4 (distinct["forcedReceivers"] as List).size

  // Now turn on preventDirectReciprocity=true -> 0 solutions exist!
  rules-impossible := solver.Rules
      --giver-group-size=1
      --prevent-same-group-giver-receiver=true
      --prevent-direct-reciprocity=true
      --sample-count=3
  impossible := solver.solve-distinct participants rules-impossible
  expect-equals 0 (impossible["solutions"] as List).size
  expect (impossible["exhaustedAllSolutions"] as bool)

test-one-way-directed-exclusions:
  // In a 3-person k=1 group (A, B, C), if A excludes B (one-way: A cannot gift B,
  // but B CAN gift A!), then the cycle A -> C -> B -> A is valid!
  // (Whereas if A <-> B were symmetric, a 3-person group with 1 couple has 0 solutions
  // when preventDirectReciprocity=true!)
  participants := [
    solver.Participant --id="p1" --email="a@example.org" --name="A" --excludes=["p2"],
    solver.Participant --id="p2" --email="b@example.org" --name="B" --excludes=[],
    solver.Participant --id="p3" --email="c@example.org" --name="C" --excludes=[],
  ]
  rules := solver.Rules
      --giver-group-size=1
      --prevent-same-group-giver-receiver=true
      --prevent-direct-reciprocity=true
      --sample-count=3

  distinct := solver.solve-distinct participants rules
  solutions := distinct["solutions"] as List
  expect-equals 1 solutions.size
  sol := solutions[0] as List
  // Receiver A (0) gets from B (1), Receiver B (1) gets from C (2), Receiver C (2) gets from A (0)
  expect-equals [1] sol[0]
  expect-equals [2] sol[1]
  expect-equals [0] sol[2]

main:
  test-k1-classic
  test-5-participants-k2-with-couple
  test-k2-engerlbengerl
  test-k3-team
  test-validation-anti-spam
  test-single-unique-solution-and-unsatisfiable
  test-one-way-directed-exclusions
  print "All solver tests passed!"
