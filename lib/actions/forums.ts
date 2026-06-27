'use server'

// Forum Server Actions
// Implementation added in TWH-3.x (forum UI prompts).
//
// createThread()    — user creates a new thread in a board
// createPost()      — user posts a reply; triggers:
//                     XP award (if is_rp_board, via admin
//                     client, character-level)
//                     Essence award (account-level)
//                     thread_reads upsert for author
//                     board_threads.updated_at via trigger
// updatePost()      — user edits their own post content
// flagPost()        — user reports a post (post_reports)
// pinThread()       — mod sets is_pinned on a thread
// lockThread()      — mod sets is_locked on a thread
// deletePost()      — mod soft-flags a post (is_flagged)
// enchantPost()     — user adds enchantment reaction
// unenchantPost()   — user removes their own enchantment
// markThreadRead()  — upserts thread_reads.last_read_at
//                     for the current user + thread.
//                     Called on every thread open.
//                     Powers My Threads turn-state tracker.

export async function forumActionsPlaceholder() {
  // Intentionally empty pending TWH-3.x.
  // Do not remove — establishes module for TypeScript
  // import resolution.
}
