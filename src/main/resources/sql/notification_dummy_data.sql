-- notification dummy data (recipient=2, various senders)
DELETE FROM tbl_notification WHERE recipient_id = 2;

-- 1. connect
INSERT INTO tbl_notification (recipient_id, sender_id, notification_type, title, content)
VALUES (2, 3, 'connect', 'new connect', 'followed you.');

-- 2. approve
INSERT INTO tbl_notification (recipient_id, sender_id, notification_type, title, content)
VALUES (2, 4, 'approve', 'expert approved', 'approved your expert request.');

-- 3. like
INSERT INTO tbl_notification (recipient_id, sender_id, notification_type, title, content, target_id, target_type)
VALUES (2, 5, 'like', 'post liked', 'liked your post.', 1, 'post');

-- 4. post
INSERT INTO tbl_notification (recipient_id, sender_id, notification_type, title, content, target_id, target_type)
VALUES (2, 6, 'post', 'new post', 'posted a new article.', 5, 'post');

-- 5. reply
INSERT INTO tbl_notification (recipient_id, sender_id, notification_type, title, content, target_id, target_type)
VALUES (2, 7, 'reply', 'new reply', 'replied to your post.', 1, 'post');

-- 6. message
INSERT INTO tbl_notification (recipient_id, sender_id, notification_type, title, content)
VALUES (2, 8, 'message', 'new message', 'sent you a message.');

-- 7. estimation
INSERT INTO tbl_notification (recipient_id, sender_id, notification_type, title, content, target_id, target_type)
VALUES (2, 9, 'estimation', 'estimation request', 'sent an estimation request.', null, 'estimation');

-- 8. system (no sender)
INSERT INTO tbl_notification (recipient_id, sender_id, notification_type, title, content)
VALUES (2, null, 'system', 'account verified', 'Your account has been verified with a blue checkmark.');

-- 9. handle (mention)
INSERT INTO tbl_notification (recipient_id, sender_id, notification_type, title, content, target_id, target_type)
VALUES (2, 10, 'handle', 'mention', 'mentioned you in a post.', 3, 'post');

-- 10. 2 hours ago connect
INSERT INTO tbl_notification (recipient_id, sender_id, notification_type, title, content, created_datetime)
VALUES (2, 11, 'connect', 'new connect', 'and 5 others followed you.', now() - interval '2 hours');

-- 11. 1 day ago like
INSERT INTO tbl_notification (recipient_id, sender_id, notification_type, title, content, target_id, target_type, created_datetime)
VALUES (2, 12, 'like', 'post liked', 'liked your post.', 2, 'post', now() - interval '1 day');

-- 12. 3 days ago system
INSERT INTO tbl_notification (recipient_id, sender_id, notification_type, title, content, created_datetime)
VALUES (2, null, 'system', 'security alert', 'A phone number was added to your account.', now() - interval '3 days');

-- 13. 5 days ago handle
INSERT INTO tbl_notification (recipient_id, sender_id, notification_type, title, content, target_id, target_type, created_datetime)
VALUES (2, 13, 'handle', 'mention', 'mentioned you in a reply.', 4, 'post', now() - interval '5 days');

-- 14. already read
INSERT INTO tbl_notification (recipient_id, sender_id, notification_type, title, content, is_read)
VALUES (2, 14, 'post', 'new post', 'posted a new article.', true);
