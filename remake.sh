#!/usr/bin/env bash

fswatch game/**/*.ts | while read; do make && echo OK; done
