jest.autoMockOff();

var VoteManager = require("../src/voteManager");
require("../src/utils");

describe("VoteManager", function () {
    describe("createEmptyVoteResults", function () {
        var candidates1 = [{ id: 1 }, { id: 2 }, { id: 3 }];
        var candidates2 = [{ id: 4 }, { id: 5 }, { id: 6 }];
        var votesCount = new VoteManager(candidates1, candidates2).voteCount;

        it("should create a list with the length of the sum of the lengths passed in", function () {
            expect(Object.keys(votesCount).length).toBe(
                candidates1.length + candidates2.length
            );
        });

        it("should create a list where every value is 0", function () {
            Object.keys(votesCount).forEach(function (key) {
                expect(votesCount[key].value).toBe(0);
            });
        });
    });

    describe("checkIfAllCandidatesInVoteAreValid", function () {
        var candidates1 = [{ id: 1 }, { id: 2 }, { id: 3 }];
        var candidates2 = [{ id: 4 }, { id: 5 }, { id: 6 }];
        var vm = new VoteManager(candidates1, candidates2, 3);

        it("should return true with defined indices", function () {
            expect(vm.checkIfAllCandidatesInVoteAreValid([1, 3, 4])).toBe(true);
        });

        it("should return false with some bogus indices", function () {
            expect(
                vm.checkIfAllCandidatesInVoteAreValid([2, 1337, "lol", 42])
            ).toBe(false);
        });
    });

    describe("increaseVoteForCandidate", function () {
        var candidates1 = [{ id: 1 }, { id: 2 }, { id: 3 }];
        var candidates2 = [{ id: 4 }, { id: 5 }, { id: 6 }];
        var vm = new VoteManager(candidates1, candidates2, 3);

        it("should increase the num of votes for candidate c and only c", function () {
            var c = 1;

            var beforeKeys = Object.keys(vm.voteCount);
            var beforeVotes = beforeKeys.map(function (key) {
                return vm.voteCount[key];
            });

            vm.increaseVoteForCandidate(c);

            var afterKeys = Object.keys(vm.voteCount);
            var afterVotes = afterKeys.map(function (key) {
                return vm.voteCount[key];
            });

            expect(beforeKeys).toEqual(afterKeys);
            beforeKeys.forEach(function (key, index) {
                if (key === c) {
                    expect(afterVotes[index].value).toBe(
                        beforeVotes[index].value + 1
                    );
                } else {
                    expect(afterVotes[index].value).toBe(
                        beforeVotes[index].value
                    );
                }
            });
        });
    });

    describe("castVote", function () {
        var candidates1 = [
            { id: 1, name: "Ada", vacant: false },
            { id: 2, name: "Haskell", vacant: false },
            { id: 3, name: "Erlang", vacant: false },
        ];

        var candidates2 = [
            { id: 4, name: "Vakant1", vacant: true },
            { id: 5, name: "Vakant2", vacant: true },
            { id: 6, name: "Vakant3", vacant: true },
        ];

        var vm = new VoteManager(candidates1, candidates2, 3);

        it("should increase the num of votes for candidate c", function () {
            var vote = [1, 4];

            var beforeObj = Object.clone(vm.voteCount);

            vm.castVote(vote, "0");

            var afterObj = Object.clone(vm.voteCount);

            expect(Object.keys(beforeObj)).toEqual(Object.keys(afterObj));

            Object.keys(beforeObj).forEach(function (key) {
                if (key === "1" || key === "4") {
                    expect(afterObj[key].value).toBe(beforeObj[key].value + 1);
                } else {
                    expect(afterObj[key].value).toBe(beforeObj[key].value);
                }
            });
        });

        it("should not increase vote for invalid vote", function () {
            var beforeObj = Object.clone(vm.voteCount);

            var invalidVote = ["invalidIndex"];

            expect(function () {
                vm.castVote(invalidVote, "1");
            }).toThrow("Invalid option voted for");

            var tooManyVotes = [1, 2, 3, 4, 5, 6];

            expect(function () {
                vm.castVote(tooManyVotes, "2");
            }).toThrow("Invalid amount of votes");

            var duplicateVotes = [3, 3, 3];

            expect(function () {
                vm.castVote(duplicateVotes, "3");
            }).toThrow("Duplicate votes");

            var afterObj = Object.clone(vm.voteCount);

            expect(beforeObj).toEqual(afterObj);
        });

        it("should throw if trying to vote when voting closed", function () {
            var vm = new VoteManager(candidates1, candidates2, 4);
            var beforeObj = Object.clone(vm.voteCount);

            var vote = [1];

            expect(vm.isOpen).toBe(true);
            vm.closeVotingSession();
            expect(vm.isOpen).toBe(false);

            expect(function () {
                vm.castVote(vote, "4");
            }).toThrow("Voting is closed");

            var afterObj = Object.clone(vm.voteCount);

            expect(beforeObj).toEqual(afterObj);
        });

        it("should allow blank vote", function () {
            var beforeObj = Object.clone(vm.voteCount);

            var blankVote = [];

            expect(function () {
                vm.castVote(blankVote, "5");
            }).not.toThrow();

            var afterObj = Object.clone(vm.voteCount);

            expect(beforeObj).toEqual(afterObj);
        });

        it("should allow number of votes less than max", function () {
            expect(function () {
                var votes = [1, 2];
                vm.castVote(votes, "6");
            }).not.toThrow();
        });

        it("should not allow voting for vacant2 if vacant1 is not voted for", function () {
            var beforeObj = Object.clone(vm.voteCount);

            var invalidVacantVote = [1, 5];

            expect(function () {
                vm.castVote(invalidVacantVote, "7");
            }).toThrow("Invalid option voted for");

            var afterObj = Object.clone(vm.voteCount);

            expect(beforeObj).toEqual(afterObj);
        });

        it("should not be able to vote twice as the same id", function () {
            var vote = [1, 4];

            var beforeObj = Object.clone(vm.voteCount);

            vm.castVote(vote, "8");
            expect(function () {
                vm.castVote(vote, "8");
            }).toThrow("User already voted");
        });
    });
});
