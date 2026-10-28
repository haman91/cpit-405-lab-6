/*
 * CPIT-405 Lab 6: JavaScript events, DOM API, and cookies.
 * Note: cookies are browser-specific; they do not synchronize counts
 * between different visitors or devices.
 */

const COOKIE_DAYS = 30;
const VOTE_COOKIE = "cpit405_lab6_vote";
const LIKE_COUNT_COOKIE = "cpit405_lab6_likes";
const DISLIKE_COUNT_COOKIE = "cpit405_lab6_dislikes";
const COMMENT_COOKIE = "cpit405_lab6_comment";

const likeButton = document.querySelector("#like-button");
const dislikeButton = document.querySelector("#dislike-button");
const likeCountElement = document.querySelector("#like-count");
const dislikeCountElement = document.querySelector("#dislike-count");
const voteStatus = document.querySelector("#vote-status");
const commentForm = document.querySelector("#comment-form");
const commentInput = document.querySelector("#comment-input");
const commentButton = document.querySelector("#comment-button");
const commentStatus = document.querySelector("#comment-status");
const charCount = document.querySelector("#char-count");
const commentsList = document.querySelector("#comments-list");
const commentCount = document.querySelector("#comment-count");
const emptyComments = document.querySelector("#empty-comments");
const resetButton = document.querySelector("#reset-button");

function setCookie(name, value, days = COOKIE_DAYS) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const prefix = `${encodeURIComponent(name)}=`;
  const item = document.cookie.split("; ").find((cookie) => cookie.startsWith(prefix));
  if (!item) return null;
  try {
    return decodeURIComponent(item.slice(prefix.length));
  } catch {
    return null;
  }
}

function deleteCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

function getCount(name) {
  const value = Number.parseInt(getCookie(name) || "0", 10);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function updateVoteUI() {
  likeCountElement.textContent = String(getCount(LIKE_COUNT_COOKIE));
  dislikeCountElement.textContent = String(getCount(DISLIKE_COUNT_COOKIE));

  const vote = getCookie(VOTE_COOKIE);
  likeButton.classList.toggle("selected", vote === "like");
  dislikeButton.classList.toggle("selected", vote === "dislike");
  likeButton.disabled = Boolean(vote);
  dislikeButton.disabled = Boolean(vote);

  if (vote === "like") {
    voteStatus.textContent = "You liked this post. Reset to change your vote.";
  } else if (vote === "dislike") {
    voteStatus.textContent = "You disliked this post. Reset to change your vote.";
  } else {
    voteStatus.textContent = "You have not voted yet.";
  }
}

function vote(choice) {
  if (getCookie(VOTE_COOKIE)) {
    voteStatus.textContent = "You have already voted. Reset your choice before voting again.";
    return;
  }

  setCookie(VOTE_COOKIE, choice);
  const counterCookie = choice === "like" ? LIKE_COUNT_COOKIE : DISLIKE_COUNT_COOKIE;
  setCookie(counterCookie, String(getCount(counterCookie) + 1));
  updateVoteUI();
}

likeButton.addEventListener("click", () => vote("like"));
dislikeButton.addEventListener("click", () => vote("dislike"));

function renderComment() {
  commentsList.replaceChildren();
  const savedComment = getCookie(COMMENT_COOKIE);
  const hasComment = savedComment !== null && savedComment.length > 0;

  if (hasComment) {
    const item = document.createElement("li");
    item.className = "comment-item";

    const meta = document.createElement("span");
    meta.className = "comment-meta";
    meta.textContent = "Your comment";

    const body = document.createElement("span");
    body.textContent = savedComment;

    item.append(meta, body);
    commentsList.append(item);
  }

  commentCount.textContent = hasComment ? "1" : "0";
  emptyComments.hidden = hasComment;
  commentInput.disabled = hasComment;
  commentButton.disabled = hasComment;
  commentStatus.textContent = hasComment
    ? "You have already commented. Reset to submit a new comment."
    : "";
}

commentInput.addEventListener("input", () => {
  charCount.textContent = `${commentInput.value.length} / 300`;
});

commentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (getCookie(COMMENT_COOKIE) !== null) {
    commentStatus.textContent = "You have already commented. Reset before posting another comment.";
    return;
  }

  const comment = commentInput.value.trim();
  if (!comment) {
    commentStatus.textContent = "Please enter a comment before submitting.";
    commentInput.focus();
    return;
  }

  setCookie(COMMENT_COOKIE, comment);
  commentInput.value = "";
  charCount.textContent = "0 / 300";
  renderComment();
});

resetButton.addEventListener("click", () => {
  const confirmed = window.confirm("Reset your vote, counters, and comment on this browser?");
  if (!confirmed) return;

  [VOTE_COOKIE, LIKE_COUNT_COOKIE, DISLIKE_COUNT_COOKIE, COMMENT_COOKIE].forEach(deleteCookie);
  commentInput.value = "";
  charCount.textContent = "0 / 300";
  updateVoteUI();
  renderComment();
  commentStatus.textContent = "Your choices and comment have been reset.";
});

// Restore the saved state from cookies on page load.
updateVoteUI();
renderComment();
