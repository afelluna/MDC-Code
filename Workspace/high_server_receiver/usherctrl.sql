-- phpMyAdmin SQL Dump
-- version 4.7.9
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 26, 2020 at 07:33 PM
-- Server version: 10.1.31-MariaDB
-- PHP Version: 7.2.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `usherctrl`
--

-- --------------------------------------------------------

--
-- Table structure for table `account_tbl`
--

CREATE TABLE `account_tbl` (
  `id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'usherctrl',
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'usherctrl2020',
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'usherctrl@gmail.com'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `account_tbl`
--

INSERT INTO `account_tbl` (`id`, `created_at`, `updated_at`, `username`, `password`, `email`) VALUES
(1, NULL, NULL, 'usherctrl', 'usherctrl2020', 'usherctrl@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `event_max`
--

CREATE TABLE `event_max` (
  `event_max_id` bigint(20) UNSIGNED NOT NULL,
  `filename` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_unique_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `intensity_max` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `x_max` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `y_max` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `z_max` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `path` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `year` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `month` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `day` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hour` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `intensity_configs`
--

CREATE TABLE `intensity_configs` (
  `id` int(10) UNSIGNED NOT NULL,
  `warning_min` int(11) DEFAULT NULL,
  `alert_min` int(11) DEFAULT NULL,
  `before` int(11) NOT NULL DEFAULT '22',
  `after` int(11) NOT NULL DEFAULT '22',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `usep` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `green_light` tinyint(1) NOT NULL DEFAULT '1',
  `yellow_light` tinyint(1) NOT NULL DEFAULT '1',
  `red_light` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `intensity_configs`
--

INSERT INTO `intensity_configs` (`id`, `warning_min`, `alert_min`, `before`, `after`, `created_at`, `updated_at`, `deleted_at`, `usep`, `green_light`, `yellow_light`, `red_light`) VALUES
(1, 4, 5, 22, 22, NULL, '2019-10-30 07:43:04', NULL, 'no', 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_resets_table', 1),
(3, '2016_06_01_000001_create_oauth_auth_codes_table', 1),
(4, '2016_06_01_000002_create_oauth_access_tokens_table', 1),
(5, '2016_06_01_000003_create_oauth_refresh_tokens_table', 1),
(6, '2016_06_01_000004_create_oauth_clients_table', 1),
(7, '2016_06_01_000005_create_oauth_personal_access_clients_table', 1),
(8, '2019_01_06_113910_update_user_tbl', 1),
(9, '2019_01_06_144845_create_permission_tables', 1),
(10, '2019_01_16_021006_create_orgs_table', 1),
(11, '2019_01_16_021019_create_members_table', 1),
(12, '2019_02_13_015355_create_buildings_table', 1),
(13, '2019_02_13_021628_create_nodes_table', 1),
(14, '2019_02_13_023244_create_warning_logs_table', 1),
(15, '2019_02_13_074554_create_building_configs_table', 1),
(16, '2019_02_14_061837_add_col_token_nodestbl', 1),
(17, '2019_03_13_091818_new_tbl_col_nodes', 1),
(18, '2019_04_23_155347_create_node_profiles_table', 1),
(19, '2019_05_06_145951_create_node_galleries_table', 1),
(20, '2019_05_06_152643_create_cities_table', 1),
(21, '2019_05_06_152702_create_regions_table', 1),
(22, '2019_05_06_155535_add_col_on_city', 1),
(23, '2019_05_06_155844_add_col_on_bldg', 1),
(24, '2019_05_13_023835_update_bldg_unique', 1),
(25, '2019_05_14_000507_update_node_tble_unique', 1),
(26, '2019_05_27_005157_add_bldgid_col_warnlogs', 1),
(27, '2019_06_13_173209_add_warn_col', 1),
(28, '2019_06_16_011252_add_node_model', 1),
(29, '2019_07_05_082149_add_warn_log_tbl_status', 1),
(30, '2019_07_15_223631_add_col_warn_logs', 1),
(31, '2019_07_16_221010_settings', 1),
(32, '2019_07_16_221335_create_control_settings_table', 1),
(33, '2019_07_16_232023_add_node_col', 1),
(34, '2019_07_16_235834_add_col_from_warn_logs', 1),
(35, '2019_08_01_111016_add_bldg_project', 1),
(36, '2019_08_06_230413_add_node_col_last_sended', 1),
(40, '2019_10_09_172407_craete_intesity_settings', 2),
(41, '2019_10_13_021720_add_warn_count', 3),
(47, '2019_10_13_154952_add_event_unique_id', 4),
(50, '2019_10_15_144309_create_intensity_configs_table', 5),
(51, '2019_10_18_101825_warning_unique', 6),
(52, '2019_09_12_142420_create_node_events_table', 7),
(53, '2019_09_15_231139_add_col_warning_logs', 8),
(54, '2019_09_19_232524_add_col_event', 8),
(55, '2019_09_20_012936_create_email_accounts_table', 8),
(56, '2019_10_22_213001_add_calibrated_config', 9),
(57, '2019_10_22_213321_add_calibrated_node', 10),
(58, '2019_10_27_174100_add_usep', 11),
(59, '2019_10_27_222742_update_node_token', 12),
(60, '2019_10_27_223511_create_useps_table', 13),
(61, '2019_10_29_104753_add_node_ips', 14),
(64, '2019_10_29_110846_create_servers_table', 15),
(65, '2019_10_30_123354_drop_intensity_settings', 16),
(66, '2020_02_21_225117_drops_tables', 17),
(67, '2020_02_21_232618_droptable', 18),
(68, '2020_02_21_233626_drop_column', 19),
(69, '2020_02_21_234210_drop_column2', 20),
(71, '2020_02_21_235518_drop_column3', 21),
(82, '2020_02_23_233206_warning_logs', 22),
(83, '2020_02_26_013408_create_account_tbl', 23),
(84, '2020_06_05_180522_create_table_event_max', 24),
(85, '2020_07_13_220552_add_col_intensity_config', 25);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` int(10) UNSIGNED NOT NULL,
  `model_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` int(10) UNSIGNED NOT NULL,
  `model_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'App\\User', '44c17bc6-b4df-4395-8be8-58316fbe8077'),
(2, 'App\\User', '881a952b-ddd4-42eb-aee9-368880507b92');

-- --------------------------------------------------------

--
-- Table structure for table `nodes`
--

CREATE TABLE `nodes` (
  `node_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `node_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `node_token` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'usher',
  `sensor_ip` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `monitor_ip` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nodes`
--

INSERT INTO `nodes` (`node_id`, `node_name`, `created_at`, `updated_at`, `deleted_at`, `node_token`, `project`, `sensor_ip`, `monitor_ip`) VALUES
('0bcd8', 'usher01', '2019-08-21 09:36:17', '2019-10-30 07:43:04', NULL, 'gLECpc44JhmfipXuHT23lN51qkD3VZGz', '1', '192.168.10.11', '192.168.10.12'),
('1484d', 'usher03', '2019-08-21 09:35:43', '2019-10-30 07:43:04', NULL, 'WoSqwM6Rif7s4b5R1AipePSWfQcNI9JW', '3', '192.168.10.31', '192.168.10.32'),
('15b1b', 'usher02', '2019-08-21 09:36:00', '2019-10-30 07:43:04', NULL, '330d48', '2', '192.168.10.21', '192.168.10.22');

-- --------------------------------------------------------

--
-- Table structure for table `node_profiles`
--

CREATE TABLE `node_profiles` (
  `node_prof_id` int(10) UNSIGNED NOT NULL,
  `positive_x_magni` decimal(10,7) NOT NULL,
  `positive_y_magni` decimal(10,7) NOT NULL,
  `positive_z_magni` decimal(10,7) NOT NULL,
  `x_direction` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `y_direction` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `z_direction` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `node_location` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `node_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `node_profiles`
--

INSERT INTO `node_profiles` (`node_prof_id`, `positive_x_magni`, `positive_y_magni`, `positive_z_magni`, `x_direction`, `y_direction`, `z_direction`, `node_location`, `node_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '0.4120000', '0.4030000', '0.4140000', 'null', 'null', 'null', 'lower', '0bcd8', '2019-10-15 03:10:02', '2019-10-30 07:38:10', NULL),
(2, '0.4120000', '0.4030000', '0.4140000', 'null', 'null', 'null', 'upper', '1484d', '2019-10-15 03:10:40', '2019-10-30 07:37:47', NULL),
(3, '0.4120000', '0.4030000', '0.4140000', 'null', 'null', 'null', 'middle', '15b1b', '2019-10-15 03:11:11', '2019-10-30 07:37:59', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `oauth_access_tokens`
--

CREATE TABLE `oauth_access_tokens` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `client_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scopes` text COLLATE utf8mb4_unicode_ci,
  `revoked` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `oauth_access_tokens`
--

INSERT INTO `oauth_access_tokens` (`id`, `user_id`, `client_id`, `name`, `scopes`, `revoked`, `created_at`, `updated_at`, `expires_at`) VALUES
('0adbe452e0eccd1aa05bbf4bd4e401d159aee235d38195ab25140cd0d313753359aa921242f04a61', '44c17bc6-b4df-4395-8be8-58316fbe8077', 1, 'MyApp', '[]', 0, '2019-08-21 09:29:52', '2019-08-21 09:29:52', '2020-08-21 17:29:52'),
('0be776d8caeb30e436a42f37cf7e8f2772cc24e1e80547fd3fa0c50c4d18b84f5af895624febdd60', '44c17bc6-b4df-4395-8be8-58316fbe8077', 1, 'MyApp', '[]', 0, '2019-10-15 03:08:54', '2019-10-15 03:08:54', '2020-10-15 11:08:54'),
('18b6be7f98519a7b34d3381b4a404cdf29982698be5f8479de6e3c8a76f0aacff04019decc60335e', '44c17bc6-b4df-4395-8be8-58316fbe8077', 1, 'MyApp', '[]', 0, '2019-09-26 06:04:44', '2019-09-26 06:04:44', '2020-09-26 14:04:44'),
('1a2bca61273356abbf76cf187a0a84dbb5443b4cec0b509f1aae22a1ee2d8abcd9e693c3faf10c6b', '881a952b-ddd4-42eb-aee9-368880507b92', 1, 'MyApp', '[]', 0, '2019-08-21 09:38:13', '2019-08-21 09:38:13', '2020-08-21 17:38:13'),
('2a410d71d9b7c46eb5e49e3f68a37b514daa8dd62a82a2b65a3632789bf0ea274400c30d33aec4f8', '44c17bc6-b4df-4395-8be8-58316fbe8077', 1, 'MyApp', '[]', 0, '2019-08-31 11:57:55', '2019-08-31 11:57:55', '2020-08-31 19:57:55'),
('3c83eef032191cd44749d42c4acdadf655ead6e244b72bdb57e20b07f039015d0e3b548240d1a052', '44c17bc6-b4df-4395-8be8-58316fbe8077', 1, 'MyApp', '[]', 0, '2019-08-31 11:33:31', '2019-08-31 11:33:31', '2020-08-31 19:33:31'),
('820f31530db8e785af576e9a05298409f479c5e269d8ea7d90260b0740df001edb1972ccacf806c9', '44c17bc6-b4df-4395-8be8-58316fbe8077', 1, 'MyApp', '[]', 0, '2019-08-22 16:02:09', '2019-08-22 16:02:09', '2020-08-23 00:02:09'),
('909989f576142c442026ecef80dfd2776cfe650cebdfe3881c3644a24d390600b9612a42586a7263', '44c17bc6-b4df-4395-8be8-58316fbe8077', 1, 'MyApp', '[]', 0, '2019-08-21 09:33:51', '2019-08-21 09:33:51', '2020-08-21 17:33:51'),
('9760959888c55c5ed5720ccb2d7ffa229ce9f92c0f9a52b3210d7a906852487bd2ab26d317bc6b4c', '881a952b-ddd4-42eb-aee9-368880507b92', 1, 'MyApp', '[]', 0, '2019-08-21 09:36:31', '2019-08-21 09:36:31', '2020-08-21 17:36:31'),
('9c4507ab363548c1f22ff6ff794998f0295b4628a90ca894cb970a7dcc334b29abece10f3634a5f3', '44c17bc6-b4df-4395-8be8-58316fbe8077', 1, 'MyApp', '[]', 0, '2019-08-27 03:08:55', '2019-08-27 03:08:55', '2020-08-27 11:08:55'),
('ece10d503356201c2e3e69d1c8a7288b7203064ab3e9aca218b0b1412e777f7bebc5c805168e585f', '44c17bc6-b4df-4395-8be8-58316fbe8077', 1, 'MyApp', '[]', 0, '2019-08-31 11:47:36', '2019-08-31 11:47:36', '2020-08-31 19:47:36'),
('ee88caac2ccd95670be6b35fe689b785d774cd155ae1b63c0ba4f4081bf18e380c77d014934a1bfd', '44c17bc6-b4df-4395-8be8-58316fbe8077', 1, 'MyApp', '[]', 0, '2019-08-21 09:38:24', '2019-08-21 09:38:24', '2020-08-21 17:38:24');

-- --------------------------------------------------------

--
-- Table structure for table `oauth_auth_codes`
--

CREATE TABLE `oauth_auth_codes` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `client_id` int(10) UNSIGNED NOT NULL,
  `scopes` text COLLATE utf8mb4_unicode_ci,
  `revoked` tinyint(1) NOT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `oauth_clients`
--

CREATE TABLE `oauth_clients` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `secret` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `redirect` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `personal_access_client` tinyint(1) NOT NULL,
  `password_client` tinyint(1) NOT NULL,
  `revoked` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `oauth_clients`
--

INSERT INTO `oauth_clients` (`id`, `user_id`, `name`, `secret`, `redirect`, `personal_access_client`, `password_client`, `revoked`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Laravel Personal Access Client', 'FpHBct7Fs3beO45B0O2uEYiQy9c9CkcD7Km7pc9R', 'http://localhost', 1, 0, 0, '2019-08-21 09:29:28', '2019-08-21 09:29:28'),
(2, NULL, 'Laravel Password Grant Client', 'dcwD5rgaugXWSiRkRCyQ47iy5nsQeXe9GZbQ6WQD', 'http://localhost', 0, 1, 0, '2019-08-21 09:29:28', '2019-08-21 09:29:28');

-- --------------------------------------------------------

--
-- Table structure for table `oauth_personal_access_clients`
--

CREATE TABLE `oauth_personal_access_clients` (
  `id` int(10) UNSIGNED NOT NULL,
  `client_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `oauth_personal_access_clients`
--

INSERT INTO `oauth_personal_access_clients` (`id`, `client_id`, `created_at`, `updated_at`) VALUES
(1, 1, '2019-08-21 09:29:28', '2019-08-21 09:29:28');

-- --------------------------------------------------------

--
-- Table structure for table `oauth_refresh_tokens`
--

CREATE TABLE `oauth_refresh_tokens` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `access_token_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `revoked` tinyint(1) NOT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'super-user', 'web', '2019-08-21 09:29:03', '2019-08-21 09:29:03'),
(2, 'admin', 'web', '2019-08-21 09:29:03', '2019-08-21 09:29:03'),
(3, 'sub-sup-user', 'web', '2019-08-21 09:29:03', '2019-08-21 09:29:03');

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` int(10) UNSIGNED NOT NULL,
  `role_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `servers`
--

CREATE TABLE `servers` (
  `id` int(10) UNSIGNED NOT NULL,
  `server_ip` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT '192.168.1.200',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `servers`
--

INSERT INTO `servers` (`id`, `server_ip`, `created_at`, `updated_at`) VALUES
(1, '192.168.1.57', NULL, '2019-10-31 01:09:31');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `user_token` longtext COLLATE utf8mb4_unicode_ci,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `avatar` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default_avatar.jpg',
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`uuid`, `name`, `email`, `email_verified_at`, `user_token`, `password`, `remember_token`, `created_at`, `updated_at`, `avatar`, `deleted_at`) VALUES
('44c17bc6-b4df-4395-8be8-58316fbe8077', 'super-user', 'controller@gmail.com', '2019-08-21 09:29:52', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjBiZTc3NmQ4Y2FlYjMwZTQzNmE0MmYzN2NmN2U4ZjI3NzJjYzI0ZTFlODA1NDdmZDNmYTBjNTBjNGQxOGI4NGY1YWY4OTU2MjRmZWJkZDYwIn0.eyJhdWQiOiIxIiwianRpIjoiMGJlNzc2ZDhjYWViMzBlNDM2YTQyZjM3Y2Y3ZThmMjc3MmNjMjRlMWU4MDU0N2ZkM2ZhMGM1MGM0ZDE4Yjg0ZjVhZjg5NTYyNGZlYmRkNjAiLCJpYXQiOjE1NzExMDg5MzQsIm5iZiI6MTU3MTEwODkzNCwiZXhwIjoxNjAyNzMxMzM0LCJzdWIiOiI0NGMxN2JjNi1iNGRmLTQzOTUtOGJlOC01ODMxNmZiZTgwNzciLCJzY29wZXMiOltdfQ.eZ3GCZHt0nmmuyB_gN8qsAXSIcQUxK-cZH-N02enYOziOOMRW4H4Wfcnk_AM2JhpU1rdAbyx_nMzGuAMetvHFv0LgFEUSsykrB8XStZQbZ-73QNQw4gNrDs7dHOha12lViC9QjUPZE_4z8hVEh_mls_RLmgY0BOJ1WvjdjffhQuMxetGSb2F44wAbp_gh-qHu0uYrOYCFnxUCVuu9InTztfu3aEFsDwaYLyhyIjAVyV2cY0YzMqUYKIKr-B1JznvEZ1KdQE0fzncFF9Mew1-vDFASEuodAdWyKOgdkR5z7bKwMXGBiiw5EfGGGL16ltl_qEIrmWPtoR3Ol2HCvi0YrXLzs_zzEuAht8enEE02428bOKWeEH4FhFZavWeMwNtC3V69T7V86bjBOaMoseHIiIEBNdjESBj5hU1ue3m76_y2a474zG7jeDf9ZfnbvWgugD75QIxXxha6r3TpgLCBQ4qLgt0AeSYP0M3pEJROf2YIA3Sd7ttQD4Aw2ivoxqOb1y_ILchtrtRvkRKeaE1iMswZd1icCIWGZ7cFdJ9Y3RUT45ValKnkRHLfHmGUV2zwPoNj8JwmbCbRrnqYup3-UdIIhSsechbst2F_PYXM29R9N8E3QSAb031aPL-LMHDr_DZjuwFppYV6cc_ueDT5FJvrmMDv6JKQjTzYQ2xIO8', '$2y$10$Y24xYiUcazHs4yS3qFtGLuXB905ntPXP9a.Aszcp41yBT0J09CgC.', NULL, '2019-08-21 09:29:52', '2019-10-15 03:08:54', 'default_avatar.jpg', NULL),
('881a952b-ddd4-42eb-aee9-368880507b92', 'demo', 'demo@gmail.com', '2019-08-21 09:36:31', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjFhMmJjYTYxMjczMzU2YWJiZjc2Y2YxODdhMGE4NGRiYjU0NDNiNGNlYzBiNTA5ZjFhYWUyMmExZWUyZDhhYmNkOWU2OTNjM2ZhZjEwYzZiIn0.eyJhdWQiOiIxIiwianRpIjoiMWEyYmNhNjEyNzMzNTZhYmJmNzZjZjE4N2EwYTg0ZGJiNTQ0M2I0Y2VjMGI1MDlmMWFhZTIyYTFlZTJkOGFiY2Q5ZTY5M2MzZmFmMTBjNmIiLCJpYXQiOjE1NjYzODAyOTMsIm5iZiI6MTU2NjM4MDI5MywiZXhwIjoxNTk4MDAyNjkzLCJzdWIiOiI4ODFhOTUyYi1kZGQ0LTQyZWItYWVlOS0zNjg4ODA1MDdiOTIiLCJzY29wZXMiOltdfQ.BWKYNsGWU8wdxumOHwu6qQPydWB2YrP0wtiddqGybIq3N9ovvNoJq7NvD0SiNN0nSW9tFfUO1z_DXYDHWYqwlIN0ELGLzpw1CO4Z8NS1i1ckCRqW1SfpX-HWUnEuB-dM9PEfxFEElkVbo1aTeN53jIhdUjK6YoXbM4QL_5M6VYtneJ9U9u10OiuFWNu18TJO34-1jkJ_y5-rHCu4awa1psUr175Z7nqyAz6kfhCa6jiNulOdjaNsebj7m708Yi4pplUr_aIGplcBbtjnG4UCWWEXcl7DuvsIwG7jNppIrM7m371GkQCmILfBt2nxFJ6pCs_4Bv8tPH1tJGQCCnmsh6lKf5fR_jilOOOJcLR57nX-yO0xkR7JStaBzG9RAvi7hLCFB5CktvfbzVX-xU-8XOak2tB7dvN6x3I9MryuiVwMcQXJ_8STbsYJw9jjBTHb_m-MR7wkNbV4BWzFYdutV1nuw0zQxNpStUnr6rTAfY2nNnxQti0OiwkFs9WsZpXBPhkwTk6UBzbuRciDxmlvXY79LiV_irF2xMobT8KYAwJP4-7j88MaS9xhtorJM2F9DEuQJbR2WzaUI7kEZuIqiILUek2C2sz3JZYckG7hi2_cyVG2igmB_e_BhuDUmiXFgDKkfRcdj5aXbuDfGGplj4G1oqLi3BRJnhfEqmhVKJo', '$2y$10$qQ.FsPjxEs4D4VidFZ2mp..RXD0AiDgskA8jf6HdmZv7q2.7PVPHi', NULL, '2019-08-21 09:36:31', '2019-08-21 09:38:14', 'default_avatar.jpg', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `warning_logs`
--

CREATE TABLE `warning_logs` (
  `warn_id` bigint(20) UNSIGNED NOT NULL,
  `node_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_unique_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `intensity` int(11) NOT NULL DEFAULT '1',
  `process` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account_tbl`
--
ALTER TABLE `account_tbl`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `event_max`
--
ALTER TABLE `event_max`
  ADD PRIMARY KEY (`event_max_id`);

--
-- Indexes for table `intensity_configs`
--
ALTER TABLE `intensity_configs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `nodes`
--
ALTER TABLE `nodes`
  ADD PRIMARY KEY (`node_id`),
  ADD UNIQUE KEY `nodes_node_name_unique` (`node_name`),
  ADD UNIQUE KEY `nodes_node_token_unique` (`node_token`);

--
-- Indexes for table `node_profiles`
--
ALTER TABLE `node_profiles`
  ADD PRIMARY KEY (`node_prof_id`),
  ADD KEY `node_profiles_node_id_foreign` (`node_id`);

--
-- Indexes for table `oauth_access_tokens`
--
ALTER TABLE `oauth_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_access_tokens_user_id_index` (`user_id`);

--
-- Indexes for table `oauth_auth_codes`
--
ALTER TABLE `oauth_auth_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_auth_codes_user_id_index` (`user_id`);

--
-- Indexes for table `oauth_clients`
--
ALTER TABLE `oauth_clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_clients_user_id_index` (`user_id`);

--
-- Indexes for table `oauth_personal_access_clients`
--
ALTER TABLE `oauth_personal_access_clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_personal_access_clients_client_id_index` (`client_id`);

--
-- Indexes for table `oauth_refresh_tokens`
--
ALTER TABLE `oauth_refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_refresh_tokens_access_token_id_index` (`access_token_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD KEY `password_resets_email_index` (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `servers`
--
ALTER TABLE `servers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `warning_logs`
--
ALTER TABLE `warning_logs`
  ADD PRIMARY KEY (`warn_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account_tbl`
--
ALTER TABLE `account_tbl`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `event_max`
--
ALTER TABLE `event_max`
  MODIFY `event_max_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `intensity_configs`
--
ALTER TABLE `intensity_configs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT for table `node_profiles`
--
ALTER TABLE `node_profiles`
  MODIFY `node_prof_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `oauth_clients`
--
ALTER TABLE `oauth_clients`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `oauth_personal_access_clients`
--
ALTER TABLE `oauth_personal_access_clients`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `servers`
--
ALTER TABLE `servers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `warning_logs`
--
ALTER TABLE `warning_logs`
  MODIFY `warn_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `node_profiles`
--
ALTER TABLE `node_profiles`
  ADD CONSTRAINT `node_profiles_node_id_foreign` FOREIGN KEY (`node_id`) REFERENCES `nodes` (`node_id`);

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
