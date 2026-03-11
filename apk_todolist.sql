-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 11, 2026 at 10:30 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `apk_todolist`
--

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `category` enum('work','study','personal','finance','social','other') DEFAULT 'personal',
  `custom_category` varchar(50) DEFAULT NULL,
  `status` enum('pending','done') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deadline` datetime DEFAULT NULL
) ;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `user_id`, `title`, `category`, `custom_category`, `status`, `created_at`, `updated_at`, `deadline`) VALUES
(8, 3, 'ghrherg', 'personal', NULL, 'pending', '2026-03-06 06:07:29', '2026-03-06 06:07:42', NULL),
(9, 3, 'gtghtht', 'work', NULL, 'pending', '2026-03-06 06:07:34', '2026-03-06 06:07:41', NULL),
(12, 1, 'egfesfse', 'study', NULL, 'done', '2026-03-06 07:41:10', '2026-03-06 07:41:30', NULL),
(13, 1, 'efesf', 'other', 'dsf', 'done', '2026-03-06 07:41:17', '2026-03-06 07:41:35', NULL),
(21, 2, 'wetfwef', 'work', NULL, 'done', '2026-03-11 04:04:50', '2026-03-11 04:05:55', '2026-03-12 04:04:00'),
(22, 2, 'rgsgsef', 'study', NULL, 'done', '2026-03-11 04:05:11', '2026-03-11 04:06:04', '2026-03-20 04:05:00'),
(23, 2, 'ryhertg', 'study', NULL, 'done', '2026-03-11 04:05:42', '2026-03-11 04:06:05', '2026-04-11 04:05:00'),
(24, 2, 'werfwer', 'study', NULL, 'done', '2026-03-11 04:08:02', '2026-03-11 04:08:14', '2026-03-11 04:06:00'),
(25, 2, 'wadfwd', 'other', 'qwdwqd', 'done', '2026-03-11 04:23:32', '2026-03-11 08:34:49', '2026-03-11 08:16:00'),
(27, 2, 'Nabung 1 juta sehari', 'finance', NULL, 'done', '2026-03-11 08:35:25', '2026-03-11 09:25:14', '2026-03-12 08:37:00'),
(28, 2, 'wdwq', 'study', NULL, 'pending', '2026-03-11 08:43:43', '2026-03-11 08:43:43', '2026-03-11 08:43:00'),
(29, 2, 'wdw', 'study', NULL, 'pending', '2026-03-11 08:44:45', '2026-03-11 08:44:45', '2026-03-11 08:47:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`) VALUES
(1, 'Afdal', 'afdal@gmail.com', '$2a$10$ZV6tQtaYjz4.BEftNEt.teJlxX1i0jjUor1tGVi/SXJP.lCpHDQM2', '2026-03-05 07:08:30'),
(2, 'Arjun', 'arjun@gmail.com', '$2a$10$DEFMixGNNrQEO.ws7AzNmO9/tJmRkafcX7wMBn2cVWsv.YUXQYGpK', '2026-03-05 07:14:23'),
(3, 'Gathan', 'gathan@gmail.com', '$2a$10$DP9V0dOOGXeReGDOgqlYT.tljSkuEilbIn5dOzpFR8/.tiJUz4Zsi', '2026-03-06 06:04:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
