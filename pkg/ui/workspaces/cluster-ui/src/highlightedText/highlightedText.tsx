// Copyright 2021 The Cockroach Authors.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the Apache License, Version 2.0, included in the file
// licenses/APL.txt.

/* eslint-disable no-useless-escape */
import React from "react";
import classNames from "classnames/bind";
import styles from "./highlightedText.module.scss";

const cx = classNames.bind(styles);

export function isStringIncludesArrayElement(
  arr: string[],
  text: string,
): boolean {
  let includes = false;
  arr.forEach(val => {
    if (text.toLowerCase().includes(val.toLowerCase())) {
      includes = true;
    }
  });
  return includes;
}

export function getWordAt(word: string, text: string): number {
  const regex = new RegExp("\\b" + word.toLowerCase() + "\\b");
  return text.toLowerCase().search(regex);
}

function rebaseText(text: string, highlight: string): string {
  const search = highlight.split(" ");
  const maxLength = 425;
  const defaultCropLength = 150;
  const defaultBeforeAfterCrop = 20;
  const isTextIncludesInTheRange425 = isStringIncludesArrayElement(
    search,
    text.slice(0, maxLength),
  );
  if (!isTextIncludesInTheRange425) {
    let newText = text.slice(0, defaultCropLength) + "...";
    let currentPosition = defaultCropLength;
    search.forEach(value => {
      const wordPosition = getWordAt(value, text);
      const isPositionMoreCurrent =
        wordPosition - defaultBeforeAfterCrop > currentPosition;
      const isPositionMoreCurrentCrop = isPositionMoreCurrent
        ? wordPosition - defaultBeforeAfterCrop
        : wordPosition;
      currentPosition =
        currentPosition +
        value.length +
        (isPositionMoreCurrent
          ? defaultBeforeAfterCrop * 2
          : defaultBeforeAfterCrop);
      newText = `${newText} ${text.slice(
        isPositionMoreCurrentCrop,
        wordPosition + (defaultBeforeAfterCrop + value.length),
      )}...`;
    });
    return newText.length < maxLength
      ? `${newText} ${text.slice(currentPosition, maxLength)}`
      : newText.slice(0, maxLength);
  }
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export function getHighlightedText(
  text: string,
  highlight: string,
  hasDarkBkg: boolean,
  isOriginalText?: boolean,
) {
  if (!highlight || highlight.length === 0) {
    return text;
  }

  highlight = highlight.replace(
    /[°§%()\[\]{}\\?´`'#|;:+^*-]+/g,
    "highlightNotDefined",
  );
  const search = highlight
    .split(" ")
    .map(val => {
      if (val.length > 0) {
        return val.toLowerCase();
      }
      return "highlightNotDefined";
    })
    .join("|");
  const parts = isOriginalText
    ? text.split(new RegExp(`(${search})`, "gi"))
    : rebaseText(text, highlight).split(new RegExp(`(${search})`, "gi"));
  const highlightClass = hasDarkBkg ? "_text-bold-light" : "_text-bold";
  return parts.map((part, i) => {
    if (search.includes(part.toLowerCase())) {
      return (
        <span key={i} className={cx(highlightClass)}>
          {`${part}`}
        </span>
      );
    } else {
      return `${part}`;
    }
  });
}
