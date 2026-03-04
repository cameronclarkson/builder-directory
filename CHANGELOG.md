# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- Improved deal matching algorithm to significantly better pre-qualify Builders and Developers.
  - Introduced deal and buy box keyword analysis to classify properties (e.g., "raw land", "unentitled", "rezoning" vs. "finished lot", "entitled", "shovel ready").
  - Strong positive scoring (+15) for Builders matched with "ready to build" properties.
  - Heavy penalties (-25) for Builders matched with raw/unentitled land, unless their specific buy box indicates an appetite for it.
  - Strong positive scoring (+15) for Developers matched with value-add opportunities like raw land.
  - Updated test suite assertions to validate new scoring boundaries.
