import { findTargetBranches } from "../backport";

const default_pattern = /^backport ([^ ]+)$/;

describe("find target branches", () => {
  describe("returns an empty list", () => {
    it("when labels is an empty list", () => {
      expect(
        findTargetBranches(
          { source_labels_pattern: default_pattern },
          [],
          "feature/one",
        ),
      ).toEqual([]);
    });

    it("when none of the labels match the pattern", () => {
      expect(
        findTargetBranches(
          { source_labels_pattern: default_pattern },
          ["a label", "another-label", "a/third/label"],
          "feature/one",
        ),
      ).toEqual([]);
    });

    it("when a label matches the pattern but doesn't capture a target branch", () => {
      expect(
        findTargetBranches(
          { source_labels_pattern: /^no capture group$/ },
          ["no capture group"],
          "feature/one",
        ),
      ).toEqual([]);
    });

    it("when the label pattern is an empty string", () => {
      expect(
        findTargetBranches(
          { source_labels_pattern: undefined },
          ["an empty string"],
          "feature/one",
        ),
      ).toEqual([]);
    });

    it("when target_branches is an empty string", () => {
      expect(
        findTargetBranches(
          { source_labels_pattern: default_pattern, target_branches: "" },
          ["a label"],
          "feature/one",
        ),
      ).toEqual([]);
    });

    it("when the label pattern only matches the headref", () => {
      expect(
        findTargetBranches(
          { source_labels_pattern: default_pattern },
          ["backport feature/one"],
          "feature/one",
        ),
      ).toEqual([]);
    });

    it("when target_branches only contains the headref", () => {
      expect(
        findTargetBranches(
          { target_branches: "feature/one" },
          [],
          "feature/one",
        ),
      ).toEqual([]);
    });

    it("when target_branch_prefix is undefined and labels is empty", () => {
      expect(
        findTargetBranches(
          {
            source_labels_pattern: default_pattern,
            target_branch_prefix: undefined,
          },
          [],
          "feature/one",
        ),
      ).toEqual([]);
    });

    it("when target_branch_prefix is set and labels is empty", () => {
      expect(
        findTargetBranches(
          {
            source_labels_pattern: default_pattern,
            target_branch_prefix: "test-prefix-",
          },
          [],
          "feature/one",
        ),
      ).toEqual([]);
    });
  });

  describe("returns selected branches", () => {
    it("when a label matches the pattern and captures a target branch", () => {
      expect(
        findTargetBranches(
          { source_labels_pattern: default_pattern },
          ["backport release-1"],
          "feature/one",
        ),
      ).toEqual(["release-1"]);
    });

    it("when several labels match the pattern and capture a target branch", () => {
      expect(
        findTargetBranches(
          { source_labels_pattern: default_pattern },
          ["backport release-1", "backport another/target/branch"],
          "feature/one",
        ),
      ).toEqual(["release-1", "another/target/branch"]);
    });

    it("when a target branch is specified", () => {
      expect(
        findTargetBranches(
          {
            source_labels_pattern: default_pattern,
            target_branches: "release-1",
          },
          [],
          "feature/one",
        ),
      ).toEqual(["release-1"]);
    });

    it("when several target branches are specified", () => {
      expect(
        findTargetBranches(
          {
            source_labels_pattern: default_pattern,
            target_branches: "release-1 another/target/branch",
          },
          [],
          "feature/one",
        ),
      ).toEqual(["release-1", "another/target/branch"]);
    });

    it("without duplicates", () => {
      expect(
        findTargetBranches(
          {
            source_labels_pattern: default_pattern,
            target_branches: "release-1",
          },
          ["backport release-1"],
          "feature/one",
        ),
      ).toEqual(["release-1"]);
    });

    it("when several labels match the pattern the headref is excluded", () => {
      expect(
        findTargetBranches(
          { source_labels_pattern: default_pattern },
          ["backport feature/one", "backport feature/two"],
          "feature/one",
        ),
      ).toEqual(["feature/two"]);
    });

    it("when several target branches are specified the headref is excluded", () => {
      expect(
        findTargetBranches(
          { target_branches: "feature/one feature/two" },
          [],
          "feature/one",
        ),
      ).toEqual(["feature/two"]);
    });

    it("when a label matches with target_branch_prefix undefined", () => {
      expect(
        findTargetBranches(
          {
            source_labels_pattern: default_pattern,
            target_branch_prefix: undefined,
          },
          ["backport release-1"],
          "feature/one",
        ),
      ).toEqual(["release-1"]);
    });

    it("when a label matches with target_branch_prefix set", () => {
      expect(
        findTargetBranches(
          {
            source_labels_pattern: default_pattern,
            target_branch_prefix: "test-prefix-",
          },
          ["backport release-1"],
          "feature/one",
        ),
      ).toEqual(["test-prefix-release-1"]);
    });

    it("when several labels match with target_branch_prefix set", () => {
      expect(
        findTargetBranches(
          {
            source_labels_pattern: default_pattern,
            target_branch_prefix: "test-prefix-",
          },
          ["backport release-1", "backport another/target/branch"],
          "feature/one",
        ),
      ).toEqual(["test-prefix-release-1", "test-prefix-another/target/branch"]);
    });

    it("when target_branches specified with target_branch_prefix set", () => {
      expect(
        findTargetBranches(
          {
            source_labels_pattern: default_pattern,
            target_branches: "release-1 another/target/branch",
            target_branch_prefix: "test-prefix-",
          },
          [],
          "feature/one",
        ),
      ).toEqual(["test-prefix-release-1", "test-prefix-another/target/branch"]);
    });
  });

  describe("target_branch_suffix handling", () => {
    it("when target_branch_suffix is undefined", () => {
      expect(
        findTargetBranches(
          {
            source_labels_pattern: default_pattern,
            target_branch_suffix: undefined,
          },
          ["backport release-1"],
          "feature/one",
        ),
      ).toEqual(["release-1"]);
    });

    it("when target_branch_suffix is empty string", () => {
      expect(
        findTargetBranches(
          {
            source_labels_pattern: default_pattern,
            target_branch_suffix: "",
          },
          ["backport release-1", "backport another/target/branch"],
          "feature/one",
        ),
      ).toEqual(["release-1", "another/target/branch"]);
    });

    // Expected behavior: suffix should be appended if implemented.
    // Current implementation ignores suffix; this test will fail until suffix support is added.
    it("when target_branch_suffix is set to '-suffix' (labels)", () => {
      expect(
        findTargetBranches(
          {
            source_labels_pattern: default_pattern,
            target_branch_suffix: "-suffix",
          },
          ["backport release-1", "backport another/target/branch"],
          "feature/one",
        ),
      ).toEqual(["release-1-suffix", "another/target/branch-suffix"]);
    });

    it("when target_branch_suffix is set to '-suffix' (target_branches input)", () => {
      expect(
        findTargetBranches(
          {
            target_branches: "release-1 another/target/branch",
            target_branch_suffix: "-suffix",
          },
          [],
          "feature/one",
        ),
      ).toEqual(["release-1-suffix", "another/target/branch-suffix"]);
    });

    it("when both prefix and suffix are set", () => {
      expect(
        findTargetBranches(
          {
            source_labels_pattern: default_pattern,
            target_branch_prefix: "pre-",
            target_branch_suffix: "-suf",
          },
          ["backport release-1"],
          "feature/one",
        ),
      ).toEqual(["pre-release-1-suf"]);
    });
  });
});
