-- ============================================================================
-- gg_all_tbl_05_03.sql
-- Full DDL snapshot of the globalgates PostgreSQL database
-- Generated: 2026-05-03
-- Source DB: jdbc:postgresql://localhost:5432/globalgates
-- Tool: pg_dump 18.3 (--schema-only --clean --if-exists --no-owner --no-privileges)
--
-- Usage:
--   psql -h <host> -U globalgates -d globalgates -f gg_all_tbl_05_03.sql
--
-- Notes:
--   * The script DROPs all existing public-schema objects before recreating them.
--   * The "DROP SCHEMA public" line is intentionally commented to preserve the
--     schema; individual DROP TYPE/TABLE/INDEX statements above handle cleanup.
--   * Run as the globalgates DB owner (or a superuser).
-- ============================================================================

--
-- PostgreSQL database dump
--


-- Dumped from database version 18.3 (Homebrew)
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.tbl_news_reply DROP CONSTRAINT IF EXISTS tbl_news_reply_news_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tbl_news_reply DROP CONSTRAINT IF EXISTS tbl_news_reply_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tbl_news_reply_like DROP CONSTRAINT IF EXISTS tbl_news_reply_like_reply_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tbl_news_reply_like DROP CONSTRAINT IF EXISTS tbl_news_reply_like_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tbl_news_like DROP CONSTRAINT IF EXISTS tbl_news_like_news_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tbl_news_like DROP CONSTRAINT IF EXISTS tbl_news_like_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tbl_news_bookmark DROP CONSTRAINT IF EXISTS tbl_news_bookmark_news_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tbl_news_bookmark DROP CONSTRAINT IF EXISTS tbl_news_bookmark_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tbl_news_bookmark DROP CONSTRAINT IF EXISTS tbl_news_bookmark_folder_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tbl_video_session DROP CONSTRAINT IF EXISTS fk_video_session_receiver;
ALTER TABLE IF EXISTS ONLY public.tbl_video_session DROP CONSTRAINT IF EXISTS fk_video_session_conversation;
ALTER TABLE IF EXISTS ONLY public.tbl_video_session DROP CONSTRAINT IF EXISTS fk_video_session_caller;
ALTER TABLE IF EXISTS ONLY public.tbl_video_recoding DROP CONSTRAINT IF EXISTS fk_video_recoding_meeting;
ALTER TABLE IF EXISTS ONLY public.tbl_trending DROP CONSTRAINT IF EXISTS fk_trending_hashtag;
ALTER TABLE IF EXISTS ONLY public.tbl_subscription DROP CONSTRAINT IF EXISTS fk_subscription_member;
ALTER TABLE IF EXISTS ONLY public.tbl_search_history DROP CONSTRAINT IF EXISTS fk_search_history_member;
ALTER TABLE IF EXISTS ONLY public.tbl_report DROP CONSTRAINT IF EXISTS fk_report_reporter;
ALTER TABLE IF EXISTS ONLY public.tbl_reply_product_rel DROP CONSTRAINT IF EXISTS fk_reply_product_rel_reply;
ALTER TABLE IF EXISTS ONLY public.tbl_reply_product_rel DROP CONSTRAINT IF EXISTS fk_reply_product_rel_product;
ALTER TABLE IF EXISTS ONLY public.tbl_category DROP CONSTRAINT IF EXISTS fk_product_category_parent_id_category;
ALTER TABLE IF EXISTS ONLY public.tbl_post_temp DROP CONSTRAINT IF EXISTS fk_post_temp_member;
ALTER TABLE IF EXISTS ONLY public.tbl_post DROP CONSTRAINT IF EXISTS fk_post_reply_post;
ALTER TABLE IF EXISTS ONLY public.tbl_post_product_rel DROP CONSTRAINT IF EXISTS fk_post_product_rel_product;
ALTER TABLE IF EXISTS ONLY public.tbl_post_product_rel DROP CONSTRAINT IF EXISTS fk_post_product_rel_post;
ALTER TABLE IF EXISTS ONLY public.tbl_post_product DROP CONSTRAINT IF EXISTS fk_post_product_post;
ALTER TABLE IF EXISTS ONLY public.tbl_post_product DROP CONSTRAINT IF EXISTS fk_post_product_category;
ALTER TABLE IF EXISTS ONLY public.tbl_post DROP CONSTRAINT IF EXISTS fk_post_member;
ALTER TABLE IF EXISTS ONLY public.tbl_post_like DROP CONSTRAINT IF EXISTS fk_post_like_post;
ALTER TABLE IF EXISTS ONLY public.tbl_post_like DROP CONSTRAINT IF EXISTS fk_post_like_member;
ALTER TABLE IF EXISTS ONLY public.tbl_post_hashtag_rel DROP CONSTRAINT IF EXISTS fk_post_hashtag_rel_post;
ALTER TABLE IF EXISTS ONLY public.tbl_post_hashtag_rel DROP CONSTRAINT IF EXISTS fk_post_hashtag_rel_hashtag;
ALTER TABLE IF EXISTS ONLY public.tbl_post_file DROP CONSTRAINT IF EXISTS fk_post_file_post;
ALTER TABLE IF EXISTS ONLY public.tbl_post_file DROP CONSTRAINT IF EXISTS fk_post_file_file;
ALTER TABLE IF EXISTS ONLY public.tbl_post DROP CONSTRAINT IF EXISTS fk_post_community;
ALTER TABLE IF EXISTS ONLY public.tbl_payment_subscribe DROP CONSTRAINT IF EXISTS fk_payment_subscription;
ALTER TABLE IF EXISTS ONLY public.tbl_payment_subscribe DROP CONSTRAINT IF EXISTS fk_payment_member;
ALTER TABLE IF EXISTS ONLY public.tbl_payment_advertisement DROP CONSTRAINT IF EXISTS fk_payment_advertisement_member;
ALTER TABLE IF EXISTS ONLY public.tbl_payment_advertisement DROP CONSTRAINT IF EXISTS fk_payment_advertisement;
ALTER TABLE IF EXISTS ONLY public.tbl_oauth DROP CONSTRAINT IF EXISTS fk_oauth_member;
ALTER TABLE IF EXISTS ONLY public.tbl_notification DROP CONSTRAINT IF EXISTS fk_notification_sender;
ALTER TABLE IF EXISTS ONLY public.tbl_notification DROP CONSTRAINT IF EXISTS fk_notification_recipient;
ALTER TABLE IF EXISTS ONLY public.tbl_notification_preference DROP CONSTRAINT IF EXISTS fk_notification_preference_member;
ALTER TABLE IF EXISTS ONLY public.tbl_news DROP CONSTRAINT IF EXISTS fk_news_post;
ALTER TABLE IF EXISTS ONLY public.tbl_news DROP CONSTRAINT IF EXISTS fk_news_admin;
ALTER TABLE IF EXISTS ONLY public.tbl_muted_word DROP CONSTRAINT IF EXISTS fk_muted_word_member;
ALTER TABLE IF EXISTS ONLY public.tbl_mute DROP CONSTRAINT IF EXISTS fk_mute_muter;
ALTER TABLE IF EXISTS ONLY public.tbl_mute DROP CONSTRAINT IF EXISTS fk_mute_muted;
ALTER TABLE IF EXISTS ONLY public.tbl_message_deletion DROP CONSTRAINT IF EXISTS fk_msg_del_message;
ALTER TABLE IF EXISTS ONLY public.tbl_message_deletion DROP CONSTRAINT IF EXISTS fk_msg_del_member;
ALTER TABLE IF EXISTS ONLY public.tbl_message DROP CONSTRAINT IF EXISTS fk_message_sender;
ALTER TABLE IF EXISTS ONLY public.tbl_message_reaction DROP CONSTRAINT IF EXISTS fk_message_reaction_message;
ALTER TABLE IF EXISTS ONLY public.tbl_message_reaction DROP CONSTRAINT IF EXISTS fk_message_reaction_member;
ALTER TABLE IF EXISTS ONLY public.tbl_message DROP CONSTRAINT IF EXISTS fk_message_conversation;
ALTER TABLE IF EXISTS ONLY public.tbl_mention DROP CONSTRAINT IF EXISTS fk_mention_tagger;
ALTER TABLE IF EXISTS ONLY public.tbl_mention DROP CONSTRAINT IF EXISTS fk_mention_tagged;
ALTER TABLE IF EXISTS ONLY public.tbl_mention DROP CONSTRAINT IF EXISTS fk_mention_post;
ALTER TABLE IF EXISTS ONLY public.tbl_member_category_rel DROP CONSTRAINT IF EXISTS fk_member_category_rel_member;
ALTER TABLE IF EXISTS ONLY public.tbl_member_category_rel DROP CONSTRAINT IF EXISTS fk_member_category_rel_category;
ALTER TABLE IF EXISTS ONLY public.tbl_meeting DROP CONSTRAINT IF EXISTS fk_meeting_requester;
ALTER TABLE IF EXISTS ONLY public.tbl_meeting DROP CONSTRAINT IF EXISTS fk_meeting_acceptor;
ALTER TABLE IF EXISTS ONLY public.tbl_follow DROP CONSTRAINT IF EXISTS fk_follow_following;
ALTER TABLE IF EXISTS ONLY public.tbl_follow DROP CONSTRAINT IF EXISTS fk_follow_follower;
ALTER TABLE IF EXISTS ONLY public.tbl_video_recoding DROP CONSTRAINT IF EXISTS fk_file_recoding;
ALTER TABLE IF EXISTS ONLY public.tbl_member_profile_file DROP CONSTRAINT IF EXISTS fk_file_member_profile_file;
ALTER TABLE IF EXISTS ONLY public.tbl_member_profile_file DROP CONSTRAINT IF EXISTS fk_file_member;
ALTER TABLE IF EXISTS ONLY public.tbl_estimation_tag_rel DROP CONSTRAINT IF EXISTS fk_estimation_tag_rel_tag;
ALTER TABLE IF EXISTS ONLY public.tbl_estimation_tag_rel DROP CONSTRAINT IF EXISTS fk_estimation_tag_rel_estimation;
ALTER TABLE IF EXISTS ONLY public.tbl_estimation DROP CONSTRAINT IF EXISTS fk_estimation_requester;
ALTER TABLE IF EXISTS ONLY public.tbl_estimation DROP CONSTRAINT IF EXISTS fk_estimation_receiver;
ALTER TABLE IF EXISTS ONLY public.tbl_estimation DROP CONSTRAINT IF EXISTS fk_estimation_product;
ALTER TABLE IF EXISTS ONLY public.tbl_conversation_setting DROP CONSTRAINT IF EXISTS fk_conversation_setting_member;
ALTER TABLE IF EXISTS ONLY public.tbl_conversation_setting DROP CONSTRAINT IF EXISTS fk_conversation_setting_conversation;
ALTER TABLE IF EXISTS ONLY public.tbl_conversation_member_rel DROP CONSTRAINT IF EXISTS fk_conversation_member_rel_member;
ALTER TABLE IF EXISTS ONLY public.tbl_conversation_member_rel DROP CONSTRAINT IF EXISTS fk_conversation_member_rel_conversation;
ALTER TABLE IF EXISTS ONLY public.tbl_conversation_member_rel DROP CONSTRAINT IF EXISTS fk_conversation_invited_rel_member;
ALTER TABLE IF EXISTS ONLY public.tbl_community_member DROP CONSTRAINT IF EXISTS fk_community_member_member;
ALTER TABLE IF EXISTS ONLY public.tbl_community_member DROP CONSTRAINT IF EXISTS fk_community_member_community;
ALTER TABLE IF EXISTS ONLY public.tbl_community_file DROP CONSTRAINT IF EXISTS fk_community_file_file;
ALTER TABLE IF EXISTS ONLY public.tbl_community_file DROP CONSTRAINT IF EXISTS fk_community_file_community;
ALTER TABLE IF EXISTS ONLY public.tbl_community DROP CONSTRAINT IF EXISTS fk_community_creator;
ALTER TABLE IF EXISTS ONLY public.tbl_community DROP CONSTRAINT IF EXISTS fk_community_category;
ALTER TABLE IF EXISTS ONLY public.tbl_chat_file DROP CONSTRAINT IF EXISTS fk_chat_file_message;
ALTER TABLE IF EXISTS ONLY public.tbl_chat_file DROP CONSTRAINT IF EXISTS fk_chat_file_file;
ALTER TABLE IF EXISTS ONLY public.tbl_business_member DROP CONSTRAINT IF EXISTS fk_business_member_member;
ALTER TABLE IF EXISTS ONLY public.tbl_bookmark DROP CONSTRAINT IF EXISTS fk_bookmark_post;
ALTER TABLE IF EXISTS ONLY public.tbl_bookmark DROP CONSTRAINT IF EXISTS fk_bookmark_member;
ALTER TABLE IF EXISTS ONLY public.tbl_bookmark_folder DROP CONSTRAINT IF EXISTS fk_bookmark_folder_member;
ALTER TABLE IF EXISTS ONLY public.tbl_bookmark DROP CONSTRAINT IF EXISTS fk_bookmark_folder;
ALTER TABLE IF EXISTS ONLY public.tbl_block DROP CONSTRAINT IF EXISTS fk_block_blocker;
ALTER TABLE IF EXISTS ONLY public.tbl_block DROP CONSTRAINT IF EXISTS fk_block_blocked;
ALTER TABLE IF EXISTS ONLY public.tbl_badge DROP CONSTRAINT IF EXISTS fk_badge_member;
ALTER TABLE IF EXISTS ONLY public.tbl_advertisement DROP CONSTRAINT IF EXISTS fk_advertisement_advertiser;
ALTER TABLE IF EXISTS ONLY public.tbl_address DROP CONSTRAINT IF EXISTS fk_address_member;
ALTER TABLE IF EXISTS ONLY public.tbl_ad_file DROP CONSTRAINT IF EXISTS fk_ad_file_file;
ALTER TABLE IF EXISTS ONLY public.tbl_ad_file DROP CONSTRAINT IF EXISTS fk_ad_file_ad;
DROP INDEX IF EXISTS public.idx_post_community_id;
DROP INDEX IF EXISTS public.idx_news_reply_news;
DROP INDEX IF EXISTS public.idx_news_reply_member;
DROP INDEX IF EXISTS public.idx_news_reply_like_reply;
DROP INDEX IF EXISTS public.idx_news_like_news;
DROP INDEX IF EXISTS public.idx_news_bookmark_news;
DROP INDEX IF EXISTS public.idx_news_bookmark_folder;
DROP INDEX IF EXISTS public.idx_community_member_member_id;
DROP INDEX IF EXISTS public.idx_community_file_community_id;
ALTER TABLE IF EXISTS ONLY public.tbl_news_reply_like DROP CONSTRAINT IF EXISTS uq_news_reply_like;
ALTER TABLE IF EXISTS ONLY public.tbl_news_like DROP CONSTRAINT IF EXISTS uq_news_like;
ALTER TABLE IF EXISTS ONLY public.tbl_news_bookmark DROP CONSTRAINT IF EXISTS uq_news_bookmark;
ALTER TABLE IF EXISTS ONLY public.tbl_bookmark DROP CONSTRAINT IF EXISTS uq_bookmark_member_post_folder;
ALTER TABLE IF EXISTS ONLY public.tbl_post_product_rel DROP CONSTRAINT IF EXISTS uk_post_product_rel_post_id;
ALTER TABLE IF EXISTS ONLY public.tbl_video_session DROP CONSTRAINT IF EXISTS tbl_video_session_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_video_recoding DROP CONSTRAINT IF EXISTS tbl_video_recoding_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_trending DROP CONSTRAINT IF EXISTS tbl_trending_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_subscription DROP CONSTRAINT IF EXISTS tbl_subscription_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_search_history DROP CONSTRAINT IF EXISTS tbl_search_history_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_report DROP CONSTRAINT IF EXISTS tbl_report_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_reply_product_rel DROP CONSTRAINT IF EXISTS tbl_reply_product_rel_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_post_temp DROP CONSTRAINT IF EXISTS tbl_post_temp_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_post_product_rel DROP CONSTRAINT IF EXISTS tbl_post_product_rel_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_post_product DROP CONSTRAINT IF EXISTS tbl_post_product_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_post DROP CONSTRAINT IF EXISTS tbl_post_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_post_like DROP CONSTRAINT IF EXISTS tbl_post_like_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_post_hashtag DROP CONSTRAINT IF EXISTS tbl_post_hashtag_tag_name_key;
ALTER TABLE IF EXISTS ONLY public.tbl_post_hashtag_rel DROP CONSTRAINT IF EXISTS tbl_post_hashtag_rel_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_post_hashtag DROP CONSTRAINT IF EXISTS tbl_post_hashtag_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_post_file DROP CONSTRAINT IF EXISTS tbl_post_file_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_payment_subscribe DROP CONSTRAINT IF EXISTS tbl_payment_subscribe_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_payment_advertisement DROP CONSTRAINT IF EXISTS tbl_payment_advertisement_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_oauth DROP CONSTRAINT IF EXISTS tbl_oauth_provider_id_key;
ALTER TABLE IF EXISTS ONLY public.tbl_oauth DROP CONSTRAINT IF EXISTS tbl_oauth_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_notification_preference DROP CONSTRAINT IF EXISTS tbl_notification_preference_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_notification DROP CONSTRAINT IF EXISTS tbl_notification_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_news_reply DROP CONSTRAINT IF EXISTS tbl_news_reply_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_news_reply_like DROP CONSTRAINT IF EXISTS tbl_news_reply_like_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_news DROP CONSTRAINT IF EXISTS tbl_news_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_news_like DROP CONSTRAINT IF EXISTS tbl_news_like_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_news_bookmark DROP CONSTRAINT IF EXISTS tbl_news_bookmark_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_muted_word DROP CONSTRAINT IF EXISTS tbl_muted_word_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_mute DROP CONSTRAINT IF EXISTS tbl_mute_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_message_reaction DROP CONSTRAINT IF EXISTS tbl_message_reaction_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_message DROP CONSTRAINT IF EXISTS tbl_message_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_message_deletion DROP CONSTRAINT IF EXISTS tbl_message_deletion_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_mention DROP CONSTRAINT IF EXISTS tbl_mention_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_member_profile_file DROP CONSTRAINT IF EXISTS tbl_member_profile_file_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_member DROP CONSTRAINT IF EXISTS tbl_member_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_member DROP CONSTRAINT IF EXISTS tbl_member_member_handle_key;
ALTER TABLE IF EXISTS ONLY public.tbl_member DROP CONSTRAINT IF EXISTS tbl_member_member_email_key;
ALTER TABLE IF EXISTS ONLY public.tbl_member_category_rel DROP CONSTRAINT IF EXISTS tbl_member_category_rel_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_meeting DROP CONSTRAINT IF EXISTS tbl_meeting_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_follow DROP CONSTRAINT IF EXISTS tbl_follow_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_file DROP CONSTRAINT IF EXISTS tbl_file_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_estimation_tag DROP CONSTRAINT IF EXISTS tbl_estimation_tag_tag_name_key;
ALTER TABLE IF EXISTS ONLY public.tbl_estimation_tag_rel DROP CONSTRAINT IF EXISTS tbl_estimation_tag_rel_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_estimation_tag DROP CONSTRAINT IF EXISTS tbl_estimation_tag_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_estimation DROP CONSTRAINT IF EXISTS tbl_estimation_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_conversation_setting DROP CONSTRAINT IF EXISTS tbl_conversation_setting_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_conversation DROP CONSTRAINT IF EXISTS tbl_conversation_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_conversation_member_rel DROP CONSTRAINT IF EXISTS tbl_conversation_member_rel_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_community DROP CONSTRAINT IF EXISTS tbl_community_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_community_member DROP CONSTRAINT IF EXISTS tbl_community_member_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_community_file DROP CONSTRAINT IF EXISTS tbl_community_file_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_chat_file DROP CONSTRAINT IF EXISTS tbl_chat_file_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_category DROP CONSTRAINT IF EXISTS tbl_category_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_category DROP CONSTRAINT IF EXISTS tbl_category_category_name_key;
ALTER TABLE IF EXISTS ONLY public.tbl_business_member DROP CONSTRAINT IF EXISTS tbl_business_member_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_business_member DROP CONSTRAINT IF EXISTS tbl_business_member_business_number_key;
ALTER TABLE IF EXISTS ONLY public.tbl_bookmark DROP CONSTRAINT IF EXISTS tbl_bookmark_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_bookmark_folder DROP CONSTRAINT IF EXISTS tbl_bookmark_folder_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_block DROP CONSTRAINT IF EXISTS tbl_block_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_badge DROP CONSTRAINT IF EXISTS tbl_badge_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_advertisement DROP CONSTRAINT IF EXISTS tbl_advertisement_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_address DROP CONSTRAINT IF EXISTS tbl_address_pkey;
ALTER TABLE IF EXISTS ONLY public.tbl_ad_file DROP CONSTRAINT IF EXISTS tbl_ad_file_pkey;
ALTER TABLE IF EXISTS public.tbl_news_reply_like ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tbl_news_reply ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tbl_news_like ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tbl_news_bookmark ALTER COLUMN id DROP DEFAULT;
DROP VIEW IF EXISTS public.vw_file_recoding;
DROP VIEW IF EXISTS public.vw_file_member;
DROP VIEW IF EXISTS public.vw_file_advertisement;
DROP VIEW IF EXISTS public.view_post_feed;
DROP VIEW IF EXISTS public.view_community_feed;
DROP VIEW IF EXISTS public.v_my_chat;
DROP TABLE IF EXISTS public.tbl_video_session;
DROP TABLE IF EXISTS public.tbl_video_recoding;
DROP TABLE IF EXISTS public.tbl_trending;
DROP TABLE IF EXISTS public.tbl_subscription;
DROP TABLE IF EXISTS public.tbl_search_history;
DROP TABLE IF EXISTS public.tbl_report;
DROP TABLE IF EXISTS public.tbl_reply_product_rel;
DROP TABLE IF EXISTS public.tbl_post_temp;
DROP TABLE IF EXISTS public.tbl_post_product_rel;
DROP TABLE IF EXISTS public.tbl_post_product;
DROP TABLE IF EXISTS public.tbl_post_like;
DROP TABLE IF EXISTS public.tbl_post_hashtag_rel;
DROP TABLE IF EXISTS public.tbl_post_hashtag;
DROP TABLE IF EXISTS public.tbl_post_file;
DROP TABLE IF EXISTS public.tbl_post;
DROP TABLE IF EXISTS public.tbl_payment_subscribe;
DROP TABLE IF EXISTS public.tbl_payment_advertisement;
DROP TABLE IF EXISTS public.tbl_oauth;
DROP TABLE IF EXISTS public.tbl_notification_preference;
DROP TABLE IF EXISTS public.tbl_notification;
DROP SEQUENCE IF EXISTS public.tbl_news_reply_like_id_seq;
DROP TABLE IF EXISTS public.tbl_news_reply_like;
DROP SEQUENCE IF EXISTS public.tbl_news_reply_id_seq;
DROP TABLE IF EXISTS public.tbl_news_reply;
DROP SEQUENCE IF EXISTS public.tbl_news_like_id_seq;
DROP TABLE IF EXISTS public.tbl_news_like;
DROP SEQUENCE IF EXISTS public.tbl_news_bookmark_id_seq;
DROP TABLE IF EXISTS public.tbl_news_bookmark;
DROP TABLE IF EXISTS public.tbl_news;
DROP TABLE IF EXISTS public.tbl_muted_word;
DROP TABLE IF EXISTS public.tbl_mute;
DROP TABLE IF EXISTS public.tbl_message_reaction;
DROP TABLE IF EXISTS public.tbl_message_deletion;
DROP TABLE IF EXISTS public.tbl_message;
DROP TABLE IF EXISTS public.tbl_mention;
DROP TABLE IF EXISTS public.tbl_member_profile_file;
DROP TABLE IF EXISTS public.tbl_member_category_rel;
DROP TABLE IF EXISTS public.tbl_member;
DROP TABLE IF EXISTS public.tbl_meeting;
DROP TABLE IF EXISTS public.tbl_follow;
DROP TABLE IF EXISTS public.tbl_file;
DROP TABLE IF EXISTS public.tbl_estimation_tag_rel;
DROP TABLE IF EXISTS public.tbl_estimation_tag;
DROP TABLE IF EXISTS public.tbl_estimation;
DROP TABLE IF EXISTS public.tbl_conversation_setting;
DROP TABLE IF EXISTS public.tbl_conversation_member_rel;
DROP TABLE IF EXISTS public.tbl_conversation;
DROP TABLE IF EXISTS public.tbl_community_member;
DROP TABLE IF EXISTS public.tbl_community_file;
DROP TABLE IF EXISTS public.tbl_community;
DROP TABLE IF EXISTS public.tbl_chat_file;
DROP TABLE IF EXISTS public.tbl_category;
DROP TABLE IF EXISTS public.tbl_business_member;
DROP TABLE IF EXISTS public.tbl_bookmark_folder;
DROP TABLE IF EXISTS public.tbl_bookmark;
DROP TABLE IF EXISTS public.tbl_block;
DROP TABLE IF EXISTS public.tbl_badge;
DROP TABLE IF EXISTS public.tbl_advertisement;
DROP TABLE IF EXISTS public.tbl_address;
DROP TABLE IF EXISTS public.tbl_ad_file;
DROP TYPE IF EXISTS public.subscription_tier;
DROP TYPE IF EXISTS public.subscription_status;
DROP TYPE IF EXISTS public.status;
DROP TYPE IF EXISTS public.report_target_type;
DROP TYPE IF EXISTS public.report_status;
DROP TYPE IF EXISTS public.profile_type;
DROP TYPE IF EXISTS public.post_status;
DROP TYPE IF EXISTS public.payment_status;
DROP TYPE IF EXISTS public.oauth_provider;
DROP TYPE IF EXISTS public.notification_type;
DROP TYPE IF EXISTS public.news_type;
DROP TYPE IF EXISTS public.news_category_type;
DROP TYPE IF EXISTS public.member_status;
DROP TYPE IF EXISTS public.member_role;
DROP TYPE IF EXISTS public.file_content_type;
DROP TYPE IF EXISTS public.estimation_status;
DROP TYPE IF EXISTS public.community_status;
DROP TYPE IF EXISTS public.community_member_role;
DROP TYPE IF EXISTS public.badge_type;
DROP TYPE IF EXISTS public.ad_status;
-- DROP SCHEMA IF EXISTS public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS public;


--
-- Name: ad_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ad_status AS ENUM (
    'active',
    'reported',
    'expired'
);


--
-- Name: badge_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.badge_type AS ENUM (
    'pro',
    'pro_plus',
    'expert'
);


--
-- Name: community_member_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.community_member_role AS ENUM (
    'admin',
    'moderator',
    'member'
);


--
-- Name: community_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.community_status AS ENUM (
    'active',
    'inactive'
);


--
-- Name: estimation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estimation_status AS ENUM (
    'approve',
    'requesting',
    'reject'
);


--
-- Name: file_content_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.file_content_type AS ENUM (
    'image',
    'video',
    'document',
    'etc',
    'audio'
);


--
-- Name: member_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.member_role AS ENUM (
    'business',
    'expert',
    'admin'
);


--
-- Name: member_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.member_status AS ENUM (
    'active',
    'inactive',
    'banned'
);


--
-- Name: news_category_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.news_category_type AS ENUM (
    'trade',
    'market',
    'policy',
    'technology',
    'etc'
);


--
-- Name: news_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.news_type AS ENUM (
    'general',
    'emergency'
);


--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_type AS ENUM (
    'connect',
    'approve',
    'like',
    'post',
    'reply',
    'message',
    'estimation',
    'system',
    'handle'
);


--
-- Name: oauth_provider; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.oauth_provider AS ENUM (
    'kakao',
    'facebook',
    'naver',
    'google'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'completed',
    'cancelled',
    'failed'
);


--
-- Name: post_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.post_status AS ENUM (
    'active',
    'inactive'
);


--
-- Name: profile_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.profile_type AS ENUM (
    'profile',
    'banner'
);


--
-- Name: report_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.report_status AS ENUM (
    'pending',
    'applied',
    'rejected'
);


--
-- Name: report_target_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.report_target_type AS ENUM (
    'post',
    'member'
);


--
-- Name: status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.status AS ENUM (
    'active',
    'inactive',
    'deleted'
);


--
-- Name: subscription_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.subscription_status AS ENUM (
    'active',
    'inactive',
    'expired'
);


--
-- Name: subscription_tier; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.subscription_tier AS ENUM (
    'free',
    'pro',
    'pro_plus',
    'expert'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: tbl_ad_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_ad_file (
    id bigint NOT NULL,
    ad_id bigint NOT NULL
);


--
-- Name: tbl_address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_address (
    id bigint NOT NULL,
    postal_code character varying(255) NOT NULL,
    country character varying(255) NOT NULL,
    country_code character varying(255) NOT NULL,
    address1 character varying(255) NOT NULL,
    address2 character varying(255),
    city character varying(255),
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_address_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_address ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_address_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_advertisement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_advertisement (
    id bigint NOT NULL,
    advertiser_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    headline character varying(255) NOT NULL,
    description text,
    landing_url character varying(255) NOT NULL,
    budget numeric(15,2) DEFAULT 0 NOT NULL,
    impression_estimate integer DEFAULT 0 NOT NULL,
    receipt_id character varying(255),
    status public.ad_status DEFAULT 'active'::public.ad_status NOT NULL,
    started_at timestamp without time zone,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_advertisement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_advertisement ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_advertisement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_badge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_badge (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    badge_type public.badge_type NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone
);


--
-- Name: tbl_badge_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_badge ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_badge_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_block; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_block (
    id bigint NOT NULL,
    blocker_id bigint NOT NULL,
    blocked_id bigint NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT tbl_block_check CHECK ((blocker_id <> blocked_id))
);


--
-- Name: tbl_block_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_block ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_block_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_bookmark; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_bookmark (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    post_id bigint NOT NULL,
    folder_id bigint,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_bookmark_folder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_bookmark_folder (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    folder_name character varying(255) NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_bookmark_folder_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_bookmark_folder ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_bookmark_folder_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_bookmark_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_bookmark ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_bookmark_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_business_member; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_business_member (
    id bigint NOT NULL,
    business_number character varying(255) NOT NULL,
    company_name character varying(255) NOT NULL,
    ceo_name character varying(255) NOT NULL,
    business_type character varying(255),
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_category (
    id bigint NOT NULL,
    product_category_parent_id bigint,
    category_name character varying(255) NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_category ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_chat_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_chat_file (
    id bigint NOT NULL,
    message_id bigint NOT NULL
);


--
-- Name: tbl_community; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_community (
    id bigint NOT NULL,
    community_name character varying(255) NOT NULL,
    description text,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL,
    creator_id bigint NOT NULL,
    community_status public.community_status DEFAULT 'active'::public.community_status NOT NULL,
    category_id bigint
);


--
-- Name: tbl_community_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_community_file (
    id bigint NOT NULL,
    community_id bigint NOT NULL
);


--
-- Name: tbl_community_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_community ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_community_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_community_member; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_community_member (
    community_id bigint NOT NULL,
    member_id bigint NOT NULL,
    joined_at timestamp without time zone DEFAULT now() NOT NULL,
    member_role public.community_member_role DEFAULT 'member'::public.community_member_role NOT NULL
);


--
-- Name: tbl_conversation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_conversation (
    id bigint NOT NULL,
    title character varying(255),
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_conversation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_conversation ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_conversation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_conversation_member_rel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_conversation_member_rel (
    id bigint NOT NULL,
    conversation_id bigint NOT NULL,
    sender_id bigint NOT NULL,
    invited_id bigint NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_conversation_member_rel_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_conversation_member_rel ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_conversation_member_rel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_conversation_setting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_conversation_setting (
    conversation_id bigint NOT NULL,
    member_id bigint NOT NULL,
    alias character varying(255),
    is_screen_blocked boolean DEFAULT false NOT NULL,
    is_muted boolean DEFAULT false NOT NULL,
    is_deleted boolean DEFAULT false,
    deleted_after_message_id bigint,
    is_pinned boolean DEFAULT false NOT NULL,
    last_read_message_id bigint,
    disappear_message character varying(255) DEFAULT 'none'::character varying,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL,
    blocked_after_message_id bigint,
    block_released_message_id bigint,
    disappear_activated_at timestamp without time zone
);


--
-- Name: tbl_estimation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_estimation (
    id bigint NOT NULL,
    requester_id bigint NOT NULL,
    receiver_id bigint,
    product_id bigint,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    deadline date,
    status public.estimation_status DEFAULT 'approve'::public.estimation_status NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL,
    location character varying(255)
);


--
-- Name: tbl_estimation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_estimation ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_estimation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_estimation_tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_estimation_tag (
    id bigint NOT NULL,
    tag_name character varying(255) NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_estimation_tag_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_estimation_tag ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_estimation_tag_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_estimation_tag_rel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_estimation_tag_rel (
    estimation_id bigint NOT NULL,
    tag_id bigint NOT NULL
);


--
-- Name: tbl_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_file (
    id bigint NOT NULL,
    original_name character varying(255) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(255) NOT NULL,
    file_size bigint DEFAULT 0 NOT NULL,
    content_type public.file_content_type DEFAULT 'image'::public.file_content_type NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_file_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_file ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_file_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_follow; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_follow (
    id bigint NOT NULL,
    follower_id bigint NOT NULL,
    following_id bigint NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT tbl_follow_check CHECK ((follower_id <> following_id))
);


--
-- Name: tbl_follow_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_follow ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_follow_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_meeting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_meeting (
    id bigint NOT NULL,
    requester_id bigint NOT NULL,
    acceptor_id bigint NOT NULL,
    title character varying(255),
    content text,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_meeting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_meeting ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_meeting_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_member; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_member (
    id bigint NOT NULL,
    member_name character varying(255),
    member_email character varying(255),
    member_password character varying(255),
    member_nickname character varying(255),
    member_handle character varying(255) NOT NULL,
    member_phone character varying(255),
    member_bio text,
    member_region character varying(255),
    member_status public.member_status DEFAULT 'active'::public.member_status NOT NULL,
    member_role public.member_role DEFAULT 'business'::public.member_role NOT NULL,
    push_enabled boolean DEFAULT true NOT NULL,
    website_url character varying(255),
    birth_date character varying(255),
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL,
    last_login_at timestamp without time zone,
    member_language character varying(255),
    member_login_verified boolean DEFAULT true,
    member_country character varying(255)
);


--
-- Name: tbl_member_category_rel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_member_category_rel (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    category_id bigint NOT NULL
);


--
-- Name: tbl_member_category_rel_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_member_category_rel ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_member_category_rel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_member_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_member ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_member_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_member_profile_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_member_profile_file (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    profile_image_type public.profile_type DEFAULT 'profile'::public.profile_type
);


--
-- Name: tbl_mention; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_mention (
    id bigint NOT NULL,
    mention_tagger_id bigint NOT NULL,
    mention_tagged_id bigint NOT NULL,
    post_id bigint NOT NULL
);


--
-- Name: tbl_mention_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_mention ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_mention_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_message (
    id bigint NOT NULL,
    conversation_id bigint NOT NULL,
    sender_id bigint NOT NULL,
    content text NOT NULL,
    reply_message_id bigint,
    is_deleted boolean DEFAULT false NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_message_deletion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_message_deletion (
    message_id bigint NOT NULL,
    member_id bigint NOT NULL,
    deleted_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_message_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_message ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_message_reaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_message_reaction (
    id bigint NOT NULL,
    message_id bigint NOT NULL,
    member_id bigint NOT NULL,
    emoji character varying(255) NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_message_reaction_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_message_reaction ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_message_reaction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_mute; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_mute (
    id bigint NOT NULL,
    muter_id bigint NOT NULL,
    muted_id bigint NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT tbl_mute_check CHECK ((muter_id <> muted_id))
);


--
-- Name: tbl_mute_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_mute ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_mute_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_muted_word; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_muted_word (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    word character varying(255) NOT NULL,
    scope character varying(255) DEFAULT 'timeline'::character varying NOT NULL,
    audience character varying(255) DEFAULT 'everyone'::character varying NOT NULL,
    duration character varying(255) DEFAULT 'forever'::character varying NOT NULL,
    expires_at timestamp without time zone,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_muted_word_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_muted_word ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_muted_word_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_news (
    id bigint NOT NULL,
    admin_id bigint,
    news_title character varying(255) NOT NULL,
    news_content text NOT NULL,
    news_source_url character varying(255),
    news_category public.news_category_type DEFAULT 'etc'::public.news_category_type NOT NULL,
    news_type public.news_type DEFAULT 'general'::public.news_type NOT NULL,
    published_at timestamp without time zone,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL,
    post_id bigint
);


--
-- Name: tbl_news_bookmark; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_news_bookmark (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    news_id bigint NOT NULL,
    folder_id bigint,
    created_datetime timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tbl_news_bookmark_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tbl_news_bookmark_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tbl_news_bookmark_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tbl_news_bookmark_id_seq OWNED BY public.tbl_news_bookmark.id;


--
-- Name: tbl_news_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_news ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_news_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_news_like; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_news_like (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    news_id bigint NOT NULL,
    created_datetime timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tbl_news_like_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tbl_news_like_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tbl_news_like_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tbl_news_like_id_seq OWNED BY public.tbl_news_like.id;


--
-- Name: tbl_news_reply; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_news_reply (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    news_id bigint NOT NULL,
    content text NOT NULL,
    reply_status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_datetime timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_datetime timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tbl_news_reply_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tbl_news_reply_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tbl_news_reply_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tbl_news_reply_id_seq OWNED BY public.tbl_news_reply.id;


--
-- Name: tbl_news_reply_like; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_news_reply_like (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    reply_id bigint NOT NULL,
    created_datetime timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tbl_news_reply_like_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tbl_news_reply_like_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tbl_news_reply_like_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tbl_news_reply_like_id_seq OWNED BY public.tbl_news_reply_like.id;


--
-- Name: tbl_notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_notification (
    id bigint NOT NULL,
    recipient_id bigint NOT NULL,
    sender_id bigint,
    notification_type public.notification_type NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    target_id bigint,
    target_type character varying(255),
    is_read boolean DEFAULT false NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_notification ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_notification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_notification_preference; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_notification_preference (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    push_enabled boolean DEFAULT true NOT NULL,
    filter_non_connect boolean DEFAULT false NOT NULL,
    filter_non_approve boolean DEFAULT false NOT NULL,
    filter_non_like boolean DEFAULT false NOT NULL,
    filter_non_post boolean DEFAULT false NOT NULL,
    filter_non_reply boolean DEFAULT false NOT NULL,
    filter_non_message boolean DEFAULT false NOT NULL,
    filter_non_estimation boolean DEFAULT false NOT NULL,
    filter_non_system boolean DEFAULT false NOT NULL,
    filter_non_handle boolean DEFAULT false NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL,
    push_connect boolean DEFAULT true NOT NULL,
    push_expert boolean DEFAULT true NOT NULL,
    push_likes boolean DEFAULT true NOT NULL,
    push_posts boolean DEFAULT true NOT NULL,
    push_comments boolean DEFAULT true NOT NULL,
    push_chat_messages boolean DEFAULT true NOT NULL,
    push_quotes boolean DEFAULT true NOT NULL,
    push_system boolean DEFAULT true NOT NULL,
    push_mentions boolean DEFAULT true NOT NULL
);


--
-- Name: tbl_notification_preference_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_notification_preference ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_notification_preference_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_oauth; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_oauth (
    id bigint NOT NULL,
    provider_id character varying(255) NOT NULL,
    provider public.oauth_provider NOT NULL,
    profile_url character varying(255),
    member_id bigint NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now()
);


--
-- Name: tbl_oauth_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_oauth ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_oauth_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_payment_advertisement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_payment_advertisement (
    id bigint NOT NULL,
    ad_id bigint NOT NULL,
    member_id bigint NOT NULL,
    amount numeric(15,2) NOT NULL,
    payment_status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    payment_method character varying(255),
    receipt_id character varying(255),
    paid_at timestamp without time zone,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_payment_advertisement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_payment_advertisement ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_payment_advertisement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_payment_subscribe; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_payment_subscribe (
    id bigint NOT NULL,
    subscription_id bigint NOT NULL,
    member_id bigint NOT NULL,
    amount numeric(15,2) NOT NULL,
    payment_status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    payment_method character varying(255),
    receipt_id character varying(255),
    paid_at timestamp without time zone,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_payment_subscribe_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_payment_subscribe ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_payment_subscribe_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_post; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_post (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    post_status public.post_status DEFAULT 'active'::public.post_status NOT NULL,
    title character varying(255),
    content text NOT NULL,
    location character varying(255),
    reply_post_id bigint,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL,
    community_id bigint,
    post_read_count integer DEFAULT 0 NOT NULL,
    product_id bigint
);


--
-- Name: tbl_post_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_post_file (
    id bigint NOT NULL,
    post_id bigint NOT NULL,
    file_id bigint NOT NULL
);


--
-- Name: tbl_post_file_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_post_file ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_post_file_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_post_hashtag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_post_hashtag (
    id bigint NOT NULL,
    tag_name character varying(255) NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_post_hashtag_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_post_hashtag ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_post_hashtag_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_post_hashtag_rel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_post_hashtag_rel (
    id bigint NOT NULL,
    post_id bigint NOT NULL,
    hashtag_id bigint NOT NULL
);


--
-- Name: tbl_post_hashtag_rel_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_post_hashtag_rel ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_post_hashtag_rel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_post_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_post ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_post_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_post_like; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_post_like (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    post_id bigint NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_post_like_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_post_like ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_post_like_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_post_product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_post_product (
    id bigint NOT NULL,
    product_category_id bigint,
    product_price integer NOT NULL,
    product_stock integer NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_post_product_rel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_post_product_rel (
    id bigint NOT NULL,
    post_id bigint NOT NULL,
    product_post_id bigint NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_post_product_rel_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_post_product_rel ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_post_product_rel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_post_temp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_post_temp (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    post_temp_content text NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL,
    post_temp_location text,
    post_temp_tags text
);


--
-- Name: tbl_post_temp_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_post_temp ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_post_temp_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_reply_product_rel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_reply_product_rel (
    id bigint NOT NULL,
    reply_post_id bigint NOT NULL,
    product_post_id bigint NOT NULL
);


--
-- Name: tbl_reply_product_rel_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_reply_product_rel ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_reply_product_rel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_report; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_report (
    id bigint NOT NULL,
    reporter_id bigint NOT NULL,
    target_id bigint NOT NULL,
    target_type public.report_target_type NOT NULL,
    reason text NOT NULL,
    status public.report_status DEFAULT 'pending'::public.report_status NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_report_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_report ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_report_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_search_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_search_history (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    search_keyword character varying(255) NOT NULL,
    search_count integer DEFAULT 0,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_search_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_search_history ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_search_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_subscription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_subscription (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    tier public.subscription_tier DEFAULT 'free'::public.subscription_tier NOT NULL,
    billing_cycle character varying(255) DEFAULT 'monthly'::character varying NOT NULL,
    status public.subscription_status DEFAULT 'active'::public.subscription_status NOT NULL,
    started_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone DEFAULT now() NOT NULL,
    quartz boolean DEFAULT true,
    next_tier character varying(20) DEFAULT NULL::character varying,
    next_billing_cycle character varying(20) DEFAULT NULL::character varying
);


--
-- Name: tbl_subscription_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_trending; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_trending (
    id bigint NOT NULL,
    hashtag_id bigint,
    keyword character varying(255),
    region character varying(255),
    created_datetime timestamp without time zone DEFAULT now() NOT NULL,
    updated_datetime timestamp without time zone
);


--
-- Name: tbl_trending_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_trending ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_trending_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tbl_video_recoding; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_video_recoding (
    id bigint NOT NULL,
    meeting_id bigint NOT NULL,
    recoding_time integer NOT NULL
);


--
-- Name: tbl_video_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tbl_video_session (
    id bigint NOT NULL,
    conversation_id bigint NOT NULL,
    caller_id bigint NOT NULL,
    receiver_id bigint NOT NULL,
    started_at timestamp without time zone DEFAULT now() NOT NULL,
    ended_at timestamp without time zone,
    duration_sec integer DEFAULT 0,
    created_datetime timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tbl_video_session_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tbl_video_session ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_video_session_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: v_my_chat; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_my_chat AS
 SELECT c.id AS conversation_id,
    rel.sender_id AS member_id,
    rel.invited_id AS partner_id,
    COALESCE(partner.member_nickname, partner.member_name) AS partner_name,
    partner.member_handle AS partner_handle,
    cs.alias,
    COALESCE(cs.alias, partner.member_nickname, partner.member_name) AS display_name,
    cs.last_read_message_id AS my_last_read,
    cs_partner.last_read_message_id AS partner_last_read,
    COALESCE(cs.is_muted, false) AS is_muted,
    COALESCE(cs.is_deleted, false) AS is_deleted,
    c.created_datetime,
    c.updated_datetime
   FROM ((((public.tbl_conversation c
     JOIN public.tbl_conversation_member_rel rel ON ((c.id = rel.conversation_id)))
     JOIN public.tbl_member partner ON ((partner.id = rel.invited_id)))
     LEFT JOIN public.tbl_conversation_setting cs ON (((cs.conversation_id = c.id) AND (cs.member_id = rel.sender_id))))
     LEFT JOIN public.tbl_conversation_setting cs_partner ON (((cs_partner.conversation_id = c.id) AND (cs_partner.member_id = rel.invited_id))))
UNION ALL
 SELECT c.id AS conversation_id,
    rel.invited_id AS member_id,
    rel.sender_id AS partner_id,
    COALESCE(partner.member_nickname, partner.member_name) AS partner_name,
    partner.member_handle AS partner_handle,
    cs.alias,
    COALESCE(cs.alias, partner.member_nickname, partner.member_name) AS display_name,
    cs.last_read_message_id AS my_last_read,
    cs_partner.last_read_message_id AS partner_last_read,
    COALESCE(cs.is_muted, false) AS is_muted,
    COALESCE(cs.is_deleted, false) AS is_deleted,
    c.created_datetime,
    c.updated_datetime
   FROM ((((public.tbl_conversation c
     JOIN public.tbl_conversation_member_rel rel ON ((c.id = rel.conversation_id)))
     JOIN public.tbl_member partner ON ((partner.id = rel.sender_id)))
     LEFT JOIN public.tbl_conversation_setting cs ON (((cs.conversation_id = c.id) AND (cs.member_id = rel.invited_id))))
     LEFT JOIN public.tbl_conversation_setting cs_partner ON (((cs_partner.conversation_id = c.id) AND (cs_partner.member_id = rel.sender_id))));


--
-- Name: view_community_feed; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.view_community_feed AS
 SELECT c.id,
    c.community_name,
    c.description,
    c.creator_id,
    c.community_status,
    c.category_id,
    cat.category_name,
    c.created_datetime,
    c.updated_datetime,
    ( SELECT count(*) AS count
           FROM public.tbl_community_member cm
          WHERE (cm.community_id = c.id)) AS member_count,
    ( SELECT count(*) AS count
           FROM public.tbl_post p
          WHERE ((p.community_id = c.id) AND (p.post_status = 'active'::public.post_status) AND (p.reply_post_id IS NULL))) AS post_count,
    ( SELECT f.file_path
           FROM (public.tbl_community_file cf
             JOIN public.tbl_file f ON ((cf.id = f.id)))
          WHERE (cf.community_id = c.id)
         LIMIT 1) AS cover_file_path
   FROM (public.tbl_community c
     LEFT JOIN public.tbl_category cat ON ((c.category_id = cat.id)))
  WHERE (c.community_status = 'active'::public.community_status);


--
-- Name: view_post_feed; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.view_post_feed AS
 SELECT p.id,
    p.member_id,
    p.post_status,
    p.title AS post_title,
    p.content AS post_content,
    p.location,
    p.reply_post_id,
    p.created_datetime,
    p.updated_datetime,
    m.member_name AS member_nickname,
    m.member_handle,
    ( SELECT f.file_name
           FROM (public.tbl_member_profile_file mpf
             JOIN public.tbl_file f ON ((mpf.id = f.id)))
          WHERE ((mpf.member_id = p.member_id) AND (mpf.profile_image_type = 'profile'::public.profile_type))
         LIMIT 1) AS member_profile_file_name,
    ( SELECT count(*) AS count
           FROM public.tbl_post_like pl
          WHERE (pl.post_id = p.id)) AS like_count,
    ( SELECT count(*) AS count
           FROM public.tbl_post rp
          WHERE ((rp.reply_post_id = p.id) AND (rp.post_status = 'active'::public.post_status))) AS reply_count,
    p.post_read_count,
    bg.badge_type,
    p.community_id,
    c.community_name,
    rel.product_post_id AS product_id,
    pp.product_price,
    pp.product_stock,
    ap.title AS product_title,
    ap.content AS product_content,
    ( SELECT string_agg((h.tag_name)::text, ','::text ORDER BY r.id) AS string_agg
           FROM (public.tbl_post_hashtag h
             JOIN public.tbl_post_hashtag_rel r ON ((h.id = r.hashtag_id)))
          WHERE (r.post_id = rel.product_post_id)) AS product_hashtags,
    ( SELECT f.file_path
           FROM (public.tbl_post_file pf
             JOIN public.tbl_file f ON ((pf.file_id = f.id)))
          WHERE (pf.post_id = rel.product_post_id)
          ORDER BY f.id
         LIMIT 1) AS product_image
   FROM ((((((public.tbl_post p
     JOIN public.tbl_member m ON ((p.member_id = m.id)))
     LEFT JOIN public.tbl_badge bg ON ((bg.member_id = p.member_id)))
     LEFT JOIN public.tbl_community c ON ((p.community_id = c.id)))
     LEFT JOIN public.tbl_post_product_rel rel ON ((rel.post_id = p.id)))
     LEFT JOIN public.tbl_post_product pp ON ((pp.id = rel.product_post_id)))
     LEFT JOIN public.tbl_post ap ON ((ap.id = rel.product_post_id)))
  WHERE ((p.post_status = 'active'::public.post_status) AND (p.reply_post_id IS NULL));


--
-- Name: vw_file_advertisement; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_file_advertisement AS
 SELECT f.id,
    f.original_name,
    f.file_name,
    f.file_path,
    f.file_size,
    f.content_type,
    f.created_datetime,
    af.ad_id
   FROM (public.tbl_ad_file af
     JOIN public.tbl_file f ON ((af.id = f.id)));


--
-- Name: vw_file_member; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_file_member AS
 SELECT f.id,
    f.original_name,
    f.file_name,
    f.file_path,
    f.file_size,
    f.content_type,
    f.created_datetime,
    pf.member_id
   FROM (public.tbl_member_profile_file pf
     JOIN public.tbl_file f ON ((pf.id = f.id)));


--
-- Name: vw_file_recoding; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_file_recoding AS
 SELECT f.id,
    f.original_name,
    f.file_name,
    f.file_path,
    f.file_size,
    f.content_type,
    f.created_datetime,
    vr.recoding_time,
    vr.meeting_id
   FROM ((public.tbl_video_recoding vr
     JOIN public.tbl_meeting m ON ((vr.meeting_id = m.id)))
     JOIN public.tbl_file f ON ((vr.id = f.id)));


--
-- Name: tbl_news_bookmark id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_bookmark ALTER COLUMN id SET DEFAULT nextval('public.tbl_news_bookmark_id_seq'::regclass);


--
-- Name: tbl_news_like id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_like ALTER COLUMN id SET DEFAULT nextval('public.tbl_news_like_id_seq'::regclass);


--
-- Name: tbl_news_reply id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_reply ALTER COLUMN id SET DEFAULT nextval('public.tbl_news_reply_id_seq'::regclass);


--
-- Name: tbl_news_reply_like id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_reply_like ALTER COLUMN id SET DEFAULT nextval('public.tbl_news_reply_like_id_seq'::regclass);


--
-- Name: tbl_ad_file tbl_ad_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_ad_file
    ADD CONSTRAINT tbl_ad_file_pkey PRIMARY KEY (id);


--
-- Name: tbl_address tbl_address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_address
    ADD CONSTRAINT tbl_address_pkey PRIMARY KEY (id);


--
-- Name: tbl_advertisement tbl_advertisement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_advertisement
    ADD CONSTRAINT tbl_advertisement_pkey PRIMARY KEY (id);


--
-- Name: tbl_badge tbl_badge_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_badge
    ADD CONSTRAINT tbl_badge_pkey PRIMARY KEY (id);


--
-- Name: tbl_block tbl_block_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_block
    ADD CONSTRAINT tbl_block_pkey PRIMARY KEY (id);


--
-- Name: tbl_bookmark_folder tbl_bookmark_folder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_bookmark_folder
    ADD CONSTRAINT tbl_bookmark_folder_pkey PRIMARY KEY (id);


--
-- Name: tbl_bookmark tbl_bookmark_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_bookmark
    ADD CONSTRAINT tbl_bookmark_pkey PRIMARY KEY (id);


--
-- Name: tbl_business_member tbl_business_member_business_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_business_member
    ADD CONSTRAINT tbl_business_member_business_number_key UNIQUE (business_number);


--
-- Name: tbl_business_member tbl_business_member_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_business_member
    ADD CONSTRAINT tbl_business_member_pkey PRIMARY KEY (id);


--
-- Name: tbl_category tbl_category_category_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_category
    ADD CONSTRAINT tbl_category_category_name_key UNIQUE (category_name);


--
-- Name: tbl_category tbl_category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_category
    ADD CONSTRAINT tbl_category_pkey PRIMARY KEY (id);


--
-- Name: tbl_chat_file tbl_chat_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_chat_file
    ADD CONSTRAINT tbl_chat_file_pkey PRIMARY KEY (id);


--
-- Name: tbl_community_file tbl_community_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_community_file
    ADD CONSTRAINT tbl_community_file_pkey PRIMARY KEY (id);


--
-- Name: tbl_community_member tbl_community_member_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_community_member
    ADD CONSTRAINT tbl_community_member_pkey PRIMARY KEY (community_id, member_id);


--
-- Name: tbl_community tbl_community_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_community
    ADD CONSTRAINT tbl_community_pkey PRIMARY KEY (id);


--
-- Name: tbl_conversation_member_rel tbl_conversation_member_rel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_conversation_member_rel
    ADD CONSTRAINT tbl_conversation_member_rel_pkey PRIMARY KEY (id);


--
-- Name: tbl_conversation tbl_conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_conversation
    ADD CONSTRAINT tbl_conversation_pkey PRIMARY KEY (id);


--
-- Name: tbl_conversation_setting tbl_conversation_setting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_conversation_setting
    ADD CONSTRAINT tbl_conversation_setting_pkey PRIMARY KEY (conversation_id, member_id);


--
-- Name: tbl_estimation tbl_estimation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_estimation
    ADD CONSTRAINT tbl_estimation_pkey PRIMARY KEY (id);


--
-- Name: tbl_estimation_tag tbl_estimation_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_estimation_tag
    ADD CONSTRAINT tbl_estimation_tag_pkey PRIMARY KEY (id);


--
-- Name: tbl_estimation_tag_rel tbl_estimation_tag_rel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_estimation_tag_rel
    ADD CONSTRAINT tbl_estimation_tag_rel_pkey PRIMARY KEY (estimation_id, tag_id);


--
-- Name: tbl_estimation_tag tbl_estimation_tag_tag_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_estimation_tag
    ADD CONSTRAINT tbl_estimation_tag_tag_name_key UNIQUE (tag_name);


--
-- Name: tbl_file tbl_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_file
    ADD CONSTRAINT tbl_file_pkey PRIMARY KEY (id);


--
-- Name: tbl_follow tbl_follow_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_follow
    ADD CONSTRAINT tbl_follow_pkey PRIMARY KEY (id);


--
-- Name: tbl_meeting tbl_meeting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_meeting
    ADD CONSTRAINT tbl_meeting_pkey PRIMARY KEY (id);


--
-- Name: tbl_member_category_rel tbl_member_category_rel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_member_category_rel
    ADD CONSTRAINT tbl_member_category_rel_pkey PRIMARY KEY (id);


--
-- Name: tbl_member tbl_member_member_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_member
    ADD CONSTRAINT tbl_member_member_email_key UNIQUE (member_email);


--
-- Name: tbl_member tbl_member_member_handle_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_member
    ADD CONSTRAINT tbl_member_member_handle_key UNIQUE (member_handle);


--
-- Name: tbl_member tbl_member_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_member
    ADD CONSTRAINT tbl_member_pkey PRIMARY KEY (id);


--
-- Name: tbl_member_profile_file tbl_member_profile_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_member_profile_file
    ADD CONSTRAINT tbl_member_profile_file_pkey PRIMARY KEY (id);


--
-- Name: tbl_mention tbl_mention_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_mention
    ADD CONSTRAINT tbl_mention_pkey PRIMARY KEY (id);


--
-- Name: tbl_message_deletion tbl_message_deletion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_message_deletion
    ADD CONSTRAINT tbl_message_deletion_pkey PRIMARY KEY (message_id, member_id);


--
-- Name: tbl_message tbl_message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_message
    ADD CONSTRAINT tbl_message_pkey PRIMARY KEY (id);


--
-- Name: tbl_message_reaction tbl_message_reaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_message_reaction
    ADD CONSTRAINT tbl_message_reaction_pkey PRIMARY KEY (id);


--
-- Name: tbl_mute tbl_mute_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_mute
    ADD CONSTRAINT tbl_mute_pkey PRIMARY KEY (id);


--
-- Name: tbl_muted_word tbl_muted_word_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_muted_word
    ADD CONSTRAINT tbl_muted_word_pkey PRIMARY KEY (id);


--
-- Name: tbl_news_bookmark tbl_news_bookmark_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_bookmark
    ADD CONSTRAINT tbl_news_bookmark_pkey PRIMARY KEY (id);


--
-- Name: tbl_news_like tbl_news_like_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_like
    ADD CONSTRAINT tbl_news_like_pkey PRIMARY KEY (id);


--
-- Name: tbl_news tbl_news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news
    ADD CONSTRAINT tbl_news_pkey PRIMARY KEY (id);


--
-- Name: tbl_news_reply_like tbl_news_reply_like_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_reply_like
    ADD CONSTRAINT tbl_news_reply_like_pkey PRIMARY KEY (id);


--
-- Name: tbl_news_reply tbl_news_reply_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_reply
    ADD CONSTRAINT tbl_news_reply_pkey PRIMARY KEY (id);


--
-- Name: tbl_notification tbl_notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_notification
    ADD CONSTRAINT tbl_notification_pkey PRIMARY KEY (id);


--
-- Name: tbl_notification_preference tbl_notification_preference_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_notification_preference
    ADD CONSTRAINT tbl_notification_preference_pkey PRIMARY KEY (id);


--
-- Name: tbl_oauth tbl_oauth_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_oauth
    ADD CONSTRAINT tbl_oauth_pkey PRIMARY KEY (id);


--
-- Name: tbl_oauth tbl_oauth_provider_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_oauth
    ADD CONSTRAINT tbl_oauth_provider_id_key UNIQUE (provider_id);


--
-- Name: tbl_payment_advertisement tbl_payment_advertisement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_payment_advertisement
    ADD CONSTRAINT tbl_payment_advertisement_pkey PRIMARY KEY (id);


--
-- Name: tbl_payment_subscribe tbl_payment_subscribe_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_payment_subscribe
    ADD CONSTRAINT tbl_payment_subscribe_pkey PRIMARY KEY (id);


--
-- Name: tbl_post_file tbl_post_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_file
    ADD CONSTRAINT tbl_post_file_pkey PRIMARY KEY (id);


--
-- Name: tbl_post_hashtag tbl_post_hashtag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_hashtag
    ADD CONSTRAINT tbl_post_hashtag_pkey PRIMARY KEY (id);


--
-- Name: tbl_post_hashtag_rel tbl_post_hashtag_rel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_hashtag_rel
    ADD CONSTRAINT tbl_post_hashtag_rel_pkey PRIMARY KEY (id);


--
-- Name: tbl_post_hashtag tbl_post_hashtag_tag_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_hashtag
    ADD CONSTRAINT tbl_post_hashtag_tag_name_key UNIQUE (tag_name);


--
-- Name: tbl_post_like tbl_post_like_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_like
    ADD CONSTRAINT tbl_post_like_pkey PRIMARY KEY (id);


--
-- Name: tbl_post tbl_post_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post
    ADD CONSTRAINT tbl_post_pkey PRIMARY KEY (id);


--
-- Name: tbl_post_product tbl_post_product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_product
    ADD CONSTRAINT tbl_post_product_pkey PRIMARY KEY (id);


--
-- Name: tbl_post_product_rel tbl_post_product_rel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_product_rel
    ADD CONSTRAINT tbl_post_product_rel_pkey PRIMARY KEY (id);


--
-- Name: tbl_post_temp tbl_post_temp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_temp
    ADD CONSTRAINT tbl_post_temp_pkey PRIMARY KEY (id);


--
-- Name: tbl_reply_product_rel tbl_reply_product_rel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_reply_product_rel
    ADD CONSTRAINT tbl_reply_product_rel_pkey PRIMARY KEY (id);


--
-- Name: tbl_report tbl_report_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_report
    ADD CONSTRAINT tbl_report_pkey PRIMARY KEY (id);


--
-- Name: tbl_search_history tbl_search_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_search_history
    ADD CONSTRAINT tbl_search_history_pkey PRIMARY KEY (id);


--
-- Name: tbl_subscription tbl_subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_subscription
    ADD CONSTRAINT tbl_subscription_pkey PRIMARY KEY (id);


--
-- Name: tbl_trending tbl_trending_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_trending
    ADD CONSTRAINT tbl_trending_pkey PRIMARY KEY (id);


--
-- Name: tbl_video_recoding tbl_video_recoding_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_video_recoding
    ADD CONSTRAINT tbl_video_recoding_pkey PRIMARY KEY (id);


--
-- Name: tbl_video_session tbl_video_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_video_session
    ADD CONSTRAINT tbl_video_session_pkey PRIMARY KEY (id);


--
-- Name: tbl_post_product_rel uk_post_product_rel_post_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_product_rel
    ADD CONSTRAINT uk_post_product_rel_post_id UNIQUE (post_id);


--
-- Name: tbl_bookmark uq_bookmark_member_post_folder; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_bookmark
    ADD CONSTRAINT uq_bookmark_member_post_folder UNIQUE (member_id, post_id, folder_id);


--
-- Name: tbl_news_bookmark uq_news_bookmark; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_bookmark
    ADD CONSTRAINT uq_news_bookmark UNIQUE (member_id, news_id);


--
-- Name: tbl_news_like uq_news_like; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_like
    ADD CONSTRAINT uq_news_like UNIQUE (member_id, news_id);


--
-- Name: tbl_news_reply_like uq_news_reply_like; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_reply_like
    ADD CONSTRAINT uq_news_reply_like UNIQUE (member_id, reply_id);


--
-- Name: idx_community_file_community_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_community_file_community_id ON public.tbl_community_file USING btree (community_id);


--
-- Name: idx_community_member_member_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_community_member_member_id ON public.tbl_community_member USING btree (member_id);


--
-- Name: idx_news_bookmark_folder; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_news_bookmark_folder ON public.tbl_news_bookmark USING btree (folder_id);


--
-- Name: idx_news_bookmark_news; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_news_bookmark_news ON public.tbl_news_bookmark USING btree (news_id);


--
-- Name: idx_news_like_news; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_news_like_news ON public.tbl_news_like USING btree (news_id);


--
-- Name: idx_news_reply_like_reply; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_news_reply_like_reply ON public.tbl_news_reply_like USING btree (reply_id);


--
-- Name: idx_news_reply_member; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_news_reply_member ON public.tbl_news_reply USING btree (member_id);


--
-- Name: idx_news_reply_news; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_news_reply_news ON public.tbl_news_reply USING btree (news_id);


--
-- Name: idx_post_community_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_post_community_id ON public.tbl_post USING btree (community_id);


--
-- Name: tbl_ad_file fk_ad_file_ad; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_ad_file
    ADD CONSTRAINT fk_ad_file_ad FOREIGN KEY (ad_id) REFERENCES public.tbl_advertisement(id);


--
-- Name: tbl_ad_file fk_ad_file_file; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_ad_file
    ADD CONSTRAINT fk_ad_file_file FOREIGN KEY (id) REFERENCES public.tbl_file(id);


--
-- Name: tbl_address fk_address_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_address
    ADD CONSTRAINT fk_address_member FOREIGN KEY (id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_advertisement fk_advertisement_advertiser; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_advertisement
    ADD CONSTRAINT fk_advertisement_advertiser FOREIGN KEY (advertiser_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_badge fk_badge_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_badge
    ADD CONSTRAINT fk_badge_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_block fk_block_blocked; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_block
    ADD CONSTRAINT fk_block_blocked FOREIGN KEY (blocked_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_block fk_block_blocker; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_block
    ADD CONSTRAINT fk_block_blocker FOREIGN KEY (blocker_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_bookmark fk_bookmark_folder; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_bookmark
    ADD CONSTRAINT fk_bookmark_folder FOREIGN KEY (folder_id) REFERENCES public.tbl_bookmark_folder(id);


--
-- Name: tbl_bookmark_folder fk_bookmark_folder_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_bookmark_folder
    ADD CONSTRAINT fk_bookmark_folder_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_bookmark fk_bookmark_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_bookmark
    ADD CONSTRAINT fk_bookmark_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_bookmark fk_bookmark_post; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_bookmark
    ADD CONSTRAINT fk_bookmark_post FOREIGN KEY (post_id) REFERENCES public.tbl_post(id);


--
-- Name: tbl_business_member fk_business_member_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_business_member
    ADD CONSTRAINT fk_business_member_member FOREIGN KEY (id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_chat_file fk_chat_file_file; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_chat_file
    ADD CONSTRAINT fk_chat_file_file FOREIGN KEY (id) REFERENCES public.tbl_file(id);


--
-- Name: tbl_chat_file fk_chat_file_message; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_chat_file
    ADD CONSTRAINT fk_chat_file_message FOREIGN KEY (message_id) REFERENCES public.tbl_message(id);


--
-- Name: tbl_community fk_community_category; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_community
    ADD CONSTRAINT fk_community_category FOREIGN KEY (category_id) REFERENCES public.tbl_category(id);


--
-- Name: tbl_community fk_community_creator; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_community
    ADD CONSTRAINT fk_community_creator FOREIGN KEY (creator_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_community_file fk_community_file_community; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_community_file
    ADD CONSTRAINT fk_community_file_community FOREIGN KEY (community_id) REFERENCES public.tbl_community(id);


--
-- Name: tbl_community_file fk_community_file_file; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_community_file
    ADD CONSTRAINT fk_community_file_file FOREIGN KEY (id) REFERENCES public.tbl_file(id);


--
-- Name: tbl_community_member fk_community_member_community; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_community_member
    ADD CONSTRAINT fk_community_member_community FOREIGN KEY (community_id) REFERENCES public.tbl_community(id);


--
-- Name: tbl_community_member fk_community_member_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_community_member
    ADD CONSTRAINT fk_community_member_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_conversation_member_rel fk_conversation_invited_rel_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_conversation_member_rel
    ADD CONSTRAINT fk_conversation_invited_rel_member FOREIGN KEY (invited_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_conversation_member_rel fk_conversation_member_rel_conversation; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_conversation_member_rel
    ADD CONSTRAINT fk_conversation_member_rel_conversation FOREIGN KEY (conversation_id) REFERENCES public.tbl_conversation(id);


--
-- Name: tbl_conversation_member_rel fk_conversation_member_rel_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_conversation_member_rel
    ADD CONSTRAINT fk_conversation_member_rel_member FOREIGN KEY (sender_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_conversation_setting fk_conversation_setting_conversation; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_conversation_setting
    ADD CONSTRAINT fk_conversation_setting_conversation FOREIGN KEY (conversation_id) REFERENCES public.tbl_conversation(id);


--
-- Name: tbl_conversation_setting fk_conversation_setting_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_conversation_setting
    ADD CONSTRAINT fk_conversation_setting_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_estimation fk_estimation_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_estimation
    ADD CONSTRAINT fk_estimation_product FOREIGN KEY (product_id) REFERENCES public.tbl_post(id);


--
-- Name: tbl_estimation fk_estimation_receiver; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_estimation
    ADD CONSTRAINT fk_estimation_receiver FOREIGN KEY (receiver_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_estimation fk_estimation_requester; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_estimation
    ADD CONSTRAINT fk_estimation_requester FOREIGN KEY (requester_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_estimation_tag_rel fk_estimation_tag_rel_estimation; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_estimation_tag_rel
    ADD CONSTRAINT fk_estimation_tag_rel_estimation FOREIGN KEY (estimation_id) REFERENCES public.tbl_estimation(id);


--
-- Name: tbl_estimation_tag_rel fk_estimation_tag_rel_tag; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_estimation_tag_rel
    ADD CONSTRAINT fk_estimation_tag_rel_tag FOREIGN KEY (tag_id) REFERENCES public.tbl_estimation_tag(id);


--
-- Name: tbl_member_profile_file fk_file_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_member_profile_file
    ADD CONSTRAINT fk_file_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_member_profile_file fk_file_member_profile_file; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_member_profile_file
    ADD CONSTRAINT fk_file_member_profile_file FOREIGN KEY (id) REFERENCES public.tbl_file(id);


--
-- Name: tbl_video_recoding fk_file_recoding; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_video_recoding
    ADD CONSTRAINT fk_file_recoding FOREIGN KEY (id) REFERENCES public.tbl_file(id);


--
-- Name: tbl_follow fk_follow_follower; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_follow
    ADD CONSTRAINT fk_follow_follower FOREIGN KEY (follower_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_follow fk_follow_following; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_follow
    ADD CONSTRAINT fk_follow_following FOREIGN KEY (following_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_meeting fk_meeting_acceptor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_meeting
    ADD CONSTRAINT fk_meeting_acceptor FOREIGN KEY (acceptor_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_meeting fk_meeting_requester; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_meeting
    ADD CONSTRAINT fk_meeting_requester FOREIGN KEY (requester_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_member_category_rel fk_member_category_rel_category; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_member_category_rel
    ADD CONSTRAINT fk_member_category_rel_category FOREIGN KEY (category_id) REFERENCES public.tbl_category(id);


--
-- Name: tbl_member_category_rel fk_member_category_rel_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_member_category_rel
    ADD CONSTRAINT fk_member_category_rel_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_mention fk_mention_post; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_mention
    ADD CONSTRAINT fk_mention_post FOREIGN KEY (post_id) REFERENCES public.tbl_post(id);


--
-- Name: tbl_mention fk_mention_tagged; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_mention
    ADD CONSTRAINT fk_mention_tagged FOREIGN KEY (mention_tagged_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_mention fk_mention_tagger; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_mention
    ADD CONSTRAINT fk_mention_tagger FOREIGN KEY (mention_tagger_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_message fk_message_conversation; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_message
    ADD CONSTRAINT fk_message_conversation FOREIGN KEY (conversation_id) REFERENCES public.tbl_conversation(id);


--
-- Name: tbl_message_reaction fk_message_reaction_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_message_reaction
    ADD CONSTRAINT fk_message_reaction_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_message_reaction fk_message_reaction_message; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_message_reaction
    ADD CONSTRAINT fk_message_reaction_message FOREIGN KEY (message_id) REFERENCES public.tbl_message(id);


--
-- Name: tbl_message fk_message_sender; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_message
    ADD CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_message_deletion fk_msg_del_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_message_deletion
    ADD CONSTRAINT fk_msg_del_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_message_deletion fk_msg_del_message; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_message_deletion
    ADD CONSTRAINT fk_msg_del_message FOREIGN KEY (message_id) REFERENCES public.tbl_message(id);


--
-- Name: tbl_mute fk_mute_muted; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_mute
    ADD CONSTRAINT fk_mute_muted FOREIGN KEY (muted_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_mute fk_mute_muter; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_mute
    ADD CONSTRAINT fk_mute_muter FOREIGN KEY (muter_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_muted_word fk_muted_word_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_muted_word
    ADD CONSTRAINT fk_muted_word_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_news fk_news_admin; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news
    ADD CONSTRAINT fk_news_admin FOREIGN KEY (admin_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_news fk_news_post; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news
    ADD CONSTRAINT fk_news_post FOREIGN KEY (post_id) REFERENCES public.tbl_post(id);


--
-- Name: tbl_notification_preference fk_notification_preference_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_notification_preference
    ADD CONSTRAINT fk_notification_preference_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_notification fk_notification_recipient; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_notification
    ADD CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_notification fk_notification_sender; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_notification
    ADD CONSTRAINT fk_notification_sender FOREIGN KEY (sender_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_oauth fk_oauth_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_oauth
    ADD CONSTRAINT fk_oauth_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_payment_advertisement fk_payment_advertisement; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_payment_advertisement
    ADD CONSTRAINT fk_payment_advertisement FOREIGN KEY (ad_id) REFERENCES public.tbl_advertisement(id);


--
-- Name: tbl_payment_advertisement fk_payment_advertisement_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_payment_advertisement
    ADD CONSTRAINT fk_payment_advertisement_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_payment_subscribe fk_payment_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_payment_subscribe
    ADD CONSTRAINT fk_payment_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_payment_subscribe fk_payment_subscription; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_payment_subscribe
    ADD CONSTRAINT fk_payment_subscription FOREIGN KEY (subscription_id) REFERENCES public.tbl_subscription(id);


--
-- Name: tbl_post fk_post_community; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post
    ADD CONSTRAINT fk_post_community FOREIGN KEY (community_id) REFERENCES public.tbl_community(id);


--
-- Name: tbl_post_file fk_post_file_file; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_file
    ADD CONSTRAINT fk_post_file_file FOREIGN KEY (file_id) REFERENCES public.tbl_file(id);


--
-- Name: tbl_post_file fk_post_file_post; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_file
    ADD CONSTRAINT fk_post_file_post FOREIGN KEY (post_id) REFERENCES public.tbl_post(id);


--
-- Name: tbl_post_hashtag_rel fk_post_hashtag_rel_hashtag; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_hashtag_rel
    ADD CONSTRAINT fk_post_hashtag_rel_hashtag FOREIGN KEY (hashtag_id) REFERENCES public.tbl_post_hashtag(id);


--
-- Name: tbl_post_hashtag_rel fk_post_hashtag_rel_post; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_hashtag_rel
    ADD CONSTRAINT fk_post_hashtag_rel_post FOREIGN KEY (post_id) REFERENCES public.tbl_post(id);


--
-- Name: tbl_post_like fk_post_like_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_like
    ADD CONSTRAINT fk_post_like_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_post_like fk_post_like_post; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_like
    ADD CONSTRAINT fk_post_like_post FOREIGN KEY (post_id) REFERENCES public.tbl_post(id);


--
-- Name: tbl_post fk_post_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post
    ADD CONSTRAINT fk_post_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_post_product fk_post_product_category; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_product
    ADD CONSTRAINT fk_post_product_category FOREIGN KEY (product_category_id) REFERENCES public.tbl_category(id);


--
-- Name: tbl_post_product fk_post_product_post; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_product
    ADD CONSTRAINT fk_post_product_post FOREIGN KEY (id) REFERENCES public.tbl_post(id);


--
-- Name: tbl_post_product_rel fk_post_product_rel_post; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_product_rel
    ADD CONSTRAINT fk_post_product_rel_post FOREIGN KEY (post_id) REFERENCES public.tbl_post(id);


--
-- Name: tbl_post_product_rel fk_post_product_rel_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_product_rel
    ADD CONSTRAINT fk_post_product_rel_product FOREIGN KEY (product_post_id) REFERENCES public.tbl_post_product(id);


--
-- Name: tbl_post fk_post_reply_post; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post
    ADD CONSTRAINT fk_post_reply_post FOREIGN KEY (reply_post_id) REFERENCES public.tbl_post(id);


--
-- Name: tbl_post_temp fk_post_temp_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_post_temp
    ADD CONSTRAINT fk_post_temp_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_category fk_product_category_parent_id_category; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_category
    ADD CONSTRAINT fk_product_category_parent_id_category FOREIGN KEY (product_category_parent_id) REFERENCES public.tbl_category(id);


--
-- Name: tbl_reply_product_rel fk_reply_product_rel_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_reply_product_rel
    ADD CONSTRAINT fk_reply_product_rel_product FOREIGN KEY (product_post_id) REFERENCES public.tbl_post(id);


--
-- Name: tbl_reply_product_rel fk_reply_product_rel_reply; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_reply_product_rel
    ADD CONSTRAINT fk_reply_product_rel_reply FOREIGN KEY (reply_post_id) REFERENCES public.tbl_post(id);


--
-- Name: tbl_report fk_report_reporter; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_report
    ADD CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_search_history fk_search_history_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_search_history
    ADD CONSTRAINT fk_search_history_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_subscription fk_subscription_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_subscription
    ADD CONSTRAINT fk_subscription_member FOREIGN KEY (member_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_trending fk_trending_hashtag; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_trending
    ADD CONSTRAINT fk_trending_hashtag FOREIGN KEY (hashtag_id) REFERENCES public.tbl_post_hashtag(id);


--
-- Name: tbl_video_recoding fk_video_recoding_meeting; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_video_recoding
    ADD CONSTRAINT fk_video_recoding_meeting FOREIGN KEY (meeting_id) REFERENCES public.tbl_meeting(id);


--
-- Name: tbl_video_session fk_video_session_caller; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_video_session
    ADD CONSTRAINT fk_video_session_caller FOREIGN KEY (caller_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_video_session fk_video_session_conversation; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_video_session
    ADD CONSTRAINT fk_video_session_conversation FOREIGN KEY (conversation_id) REFERENCES public.tbl_conversation(id);


--
-- Name: tbl_video_session fk_video_session_receiver; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_video_session
    ADD CONSTRAINT fk_video_session_receiver FOREIGN KEY (receiver_id) REFERENCES public.tbl_member(id);


--
-- Name: tbl_news_bookmark tbl_news_bookmark_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_bookmark
    ADD CONSTRAINT tbl_news_bookmark_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.tbl_bookmark_folder(id) ON DELETE SET NULL;


--
-- Name: tbl_news_bookmark tbl_news_bookmark_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_bookmark
    ADD CONSTRAINT tbl_news_bookmark_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.tbl_member(id) ON DELETE CASCADE;


--
-- Name: tbl_news_bookmark tbl_news_bookmark_news_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_bookmark
    ADD CONSTRAINT tbl_news_bookmark_news_id_fkey FOREIGN KEY (news_id) REFERENCES public.tbl_news(id) ON DELETE CASCADE;


--
-- Name: tbl_news_like tbl_news_like_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_like
    ADD CONSTRAINT tbl_news_like_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.tbl_member(id) ON DELETE CASCADE;


--
-- Name: tbl_news_like tbl_news_like_news_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_like
    ADD CONSTRAINT tbl_news_like_news_id_fkey FOREIGN KEY (news_id) REFERENCES public.tbl_news(id) ON DELETE CASCADE;


--
-- Name: tbl_news_reply_like tbl_news_reply_like_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_reply_like
    ADD CONSTRAINT tbl_news_reply_like_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.tbl_member(id) ON DELETE CASCADE;


--
-- Name: tbl_news_reply_like tbl_news_reply_like_reply_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_reply_like
    ADD CONSTRAINT tbl_news_reply_like_reply_id_fkey FOREIGN KEY (reply_id) REFERENCES public.tbl_news_reply(id) ON DELETE CASCADE;


--
-- Name: tbl_news_reply tbl_news_reply_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_reply
    ADD CONSTRAINT tbl_news_reply_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.tbl_member(id) ON DELETE CASCADE;


--
-- Name: tbl_news_reply tbl_news_reply_news_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tbl_news_reply
    ADD CONSTRAINT tbl_news_reply_news_id_fkey FOREIGN KEY (news_id) REFERENCES public.tbl_news(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


