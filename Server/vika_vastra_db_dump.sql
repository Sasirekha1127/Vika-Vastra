-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: vika_vasthra_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `banners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `sortOrder` int(11) DEFAULT 1,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (4,'Royal Kanchipuram','HANDWOVEN HERITAGE Best collection','Pure mulberry silk woven with authentic temple gold zari by master artisans.\nTimeless South Indian heirlooms crafted for sacred celebrations.','uploads/banners/hero-banner-kanchipuram.jpg','/shop?category=Kanchipuram%20Silk',1,'Active','2026-11-12 04:46:55','2026-11-12 04:46:55'),(5,'Banarasi Splendor','WEDDING TROUSSEAU EXCLUSIVE','Opulent kadhwa gold weaves and regal Katan silk drapes curated\nfor every unforgettable bridal and festive moment.','uploads/banners/hero-banner-banarasi.jpg','/shop?category=Banarasi%20Silk',2,'Active','2026-11-12 04:46:55','2026-11-12 04:46:55'),(6,'Festive Silk Drapes','NEW ARRIVALS · UP TO 40% OFF','Featherlight soft silks, tissue golds, and contemporary handlooms\ndesigned for effortless radiance on every special occasion.','uploads/banners/hero-banner-softsilk.jpg','/shop?category=Soft%20Silk%20Saree',3,'Active','2026-11-12 04:46:55','2026-11-12 04:46:55');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `brands` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `brandName` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `carts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customerId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `weight` varchar(255) DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `price` float NOT NULL DEFAULT 0,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `variantId` int(11) DEFAULT NULL,
  `variantAttributes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variantAttributes`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `discountType` enum('none','flat','percentage') NOT NULL DEFAULT 'none',
  `discountValue` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Soft Silk Saree','uploads/saree-prod-02.jpeg','2026-06-22 16:48:25','2026-11-11 12:40:08',1,'none',0.00),(2,'Silk Cotton Saree','uploads/saree-prod-03.jpeg','2026-06-22 16:48:41','2026-11-11 12:40:08',2,'none',0.00),(3,'Kanchipuram Silk','uploads/saree-prod-01.jpeg','2026-11-10 06:30:20','2026-11-11 12:40:08',3,'none',0.00),(4,'Banarasi Silk','uploads/saree-prod-04.jpeg','2026-11-10 06:30:47','2026-11-11 12:40:08',4,'none',0.00),(5,'Pure Cotton Saree','uploads/saree-prod-06.jpeg','2026-11-10 06:31:05','2026-11-11 12:40:08',5,'none',0.00),(6,'Tissue & Organza Saree','uploads/saree-prod-10.jpeg','2026-11-10 06:31:29','2026-11-11 12:40:08',6,'none',0.00),(7,'Pochampally Ikat','uploads/saree-prod-12.jpeg','2026-11-10 06:31:39','2026-11-11 12:40:08',7,'none',0.00),(8,'Bridal Wedding Saree','uploads/saree-prod-14.jpeg','2026-11-10 06:31:54','2026-11-11 12:40:08',8,'none',0.00),(9,'Party Wear Georgette','uploads/saree-prod-18.jpeg','2026-11-10 06:32:04','2026-11-11 12:40:08',9,'none',0.00),(10,'Chettinad Cotton','uploads/saree-prod-20.jpeg','2026-11-11 12:40:08','2026-11-11 12:40:08',10,'none',0.00);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','replied') DEFAULT 'new',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coupons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `type` enum('percent','fixed') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `min_order` decimal(10,2) DEFAULT 0.00,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `expires_at` datetime DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `show_in_checkout` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customeraddresses`
--

DROP TABLE IF EXISTS `customeraddresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customeraddresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `type` enum('billing','shipping') NOT NULL DEFAULT 'billing',
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `company` varchar(200) DEFAULT NULL,
  `address1` varchar(255) NOT NULL,
  `address2` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postcode` varchar(20) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `phone2` varchar(20) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `customeraddresses_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `userlogin` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customeraddresses`
--

LOCK TABLES `customeraddresses` WRITE;
/*!40000 ALTER TABLE `customeraddresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `customeraddresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_zones`
--

DROP TABLE IF EXISTS `delivery_zones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `delivery_zones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `state` varchar(100) NOT NULL DEFAULT '',
  `district` varchar(100) NOT NULL,
  `charge` decimal(10,2) NOT NULL DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_zones`
--

LOCK TABLES `delivery_zones` WRITE;
/*!40000 ALTER TABLE `delivery_zones` DISABLE KEYS */;
INSERT INTO `delivery_zones` VALUES (1,'Tamil Nadu','Tamil Nadu',70.00,1,'2026-06-24 04:38:10','2026-06-24 04:38:10');
/*!40000 ALTER TABLE `delivery_zones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instagram_posts`
--

DROP TABLE IF EXISTS `instagram_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `instagram_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL,
  `tag` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `postUrl` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `sortOrder` int(11) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instagram_posts`
--

LOCK TABLES `instagram_posts` WRITE;
/*!40000 ALTER TABLE `instagram_posts` DISABLE KEYS */;
INSERT INTO `instagram_posts` VALUES (1,'summer Best collection','new arrival','uploads/instagram/1794300053976-726926740.png','https://www.instagram.com/p/DEBzn6TvDS9/?img_index=1','Active',1,'2026-06-23 07:46:03','2026-11-10 08:40:54');
/*!40000 ALTER TABLE `instagram_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `live_products`
--

DROP TABLE IF EXISTS `live_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `live_products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `video` varchar(255) DEFAULT NULL,
  `mediaType` enum('image','video') DEFAULT 'image',
  `price` decimal(10,2) NOT NULL,
  `originalPrice` decimal(10,2) DEFAULT NULL,
  `discountPercent` int(11) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `productId` int(11) DEFAULT NULL,
  `sortOrder` int(11) DEFAULT 1,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `productId` (`productId`),
  CONSTRAINT `live_products_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `live_products`
--

LOCK TABLES `live_products` WRITE;
/*!40000 ALTER TABLE `live_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `live_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offer_banners`
--

DROP TABLE IF EXISTS `offer_banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `offer_banners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `discountLabel` varchar(255) DEFAULT NULL,
  `brandTag` varchar(255) DEFAULT NULL,
  `shopUrl` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `titleColor` varchar(20) DEFAULT '#ffffff',
  `discountColor` varchar(20) DEFAULT '#f5d78e',
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offer_banners`
--

LOCK TABLES `offer_banners` WRITE;
/*!40000 ALTER TABLE `offer_banners` DISABLE KEYS */;
/*!40000 ALTER TABLE `offer_banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderitems`
--

DROP TABLE IF EXISTS `orderitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orderitems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `weight` varchar(255) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `price` decimal(10,2) DEFAULT NULL,
  `status` enum('Pending','Processing','Shipped','Out for Delivery','Delivered','Cancelled','Returned') DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `orderId` int(11) DEFAULT NULL,
  `variantId` int(11) DEFAULT NULL,
  `variantAttributes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variantAttributes`)),
  `gstType` enum('inclusive','exclusive') NOT NULL DEFAULT 'exclusive',
  `gstRate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `taxableAmount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `taxAmount` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `orderId` (`orderId`),
  CONSTRAINT `orderitems_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orderitems_ibfk_2` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderitems`
--

LOCK TABLES `orderitems` WRITE;
/*!40000 ALTER TABLE `orderitems` DISABLE KEYS */;
INSERT INTO `orderitems` VALUES (1,1,'Silk Cotton Saree','http://localhost:5000/api/uploads/prod-1782198561382-bww0f.png',NULL,2,1200.00,'','2026-06-24 04:39:29','2026-06-24 04:39:29',1,NULL,NULL,'exclusive',0.00,0.00,0.00);
/*!40000 ALTER TABLE `orderitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_number` varchar(255) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_phone` varchar(255) DEFAULT NULL,
  `customer_phone2` varchar(255) DEFAULT NULL,
  `billing_address` text DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `order_notes` text DEFAULT NULL,
  `subtotal` float DEFAULT 0,
  `delivery_charge` float DEFAULT 0,
  `tax` float DEFAULT 0,
  `discount` float DEFAULT 0,
  `total` float DEFAULT 0,
  `coupon_code` varchar(255) DEFAULT NULL,
  `payment_id` varchar(255) DEFAULT NULL,
  `razorpay_order_id` varchar(255) DEFAULT NULL,
  `razorpay_signature` varchar(255) DEFAULT NULL,
  `payment_status` enum('paid','pending','failed') DEFAULT 'paid',
  `status` enum('processing','confirmed','shipped','in_transit','out_for_delivery','delivered','cancelled','return_requested','return_approved','return_picked_up','return_received','refunded') DEFAULT 'processing',
  `awb_code` varchar(255) DEFAULT NULL,
  `courier_name` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'VV-001',5,'lavu p','lavu6385@gmail.com','1234567890','1234567890','{\"firstName\":\"lavu\",\"lastName\":\"p\",\"company\":\"\",\"address1\":\"qwertyu\",\"address2\":\"\",\"city\":\"qwert\",\"state\":\"Tamil Nadu\",\"postcode\":\"123456\",\"phone\":\"1234567890\",\"phone2\":\"1234567890\",\"email\":\"lavu6385@gmail.com\",\"landmark\":\"qwert\",\"district\":\"qwert\",\"postOffice\":\"qwer\"}','{\"firstName\":\"lavu\",\"lastName\":\"p\",\"company\":\"\",\"address1\":\"qwertyu\",\"address2\":\"\",\"city\":\"qwert\",\"state\":\"Tamil Nadu\",\"postcode\":\"123456\",\"phone\":\"1234567890\",\"phone2\":\"1234567890\",\"email\":\"lavu6385@gmail.com\",\"landmark\":\"qwert\",\"district\":\"qwert\",\"postOffice\":\"qwer\"}','\nDelivery State: Tamil Nadu',2400,70,120,0,2590,NULL,'pay_T5L73dRa6MiuUl','order_T5L6t8dwHbgBMT','d81fab8a91c35798d788efd4320bbd7b052d2ebb48543c2b7edd044c87bc1b6b','paid','confirmed',NULL,NULL,'http://localhost:5000/api/uploads/prod-1782198561382-bww0f.png','2026-06-24 04:39:29','2026-06-24 04:39:29');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productimages`
--

DROP TABLE IF EXISTS `productimages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productimages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `productId` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `sortOrder` int(11) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `productId` (`productId`),
  CONSTRAINT `productimages_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productimages`
--

LOCK TABLES `productimages` WRITE;
/*!40000 ALTER TABLE `productimages` DISABLE KEYS */;
INSERT INTO `productimages` VALUES (1,1,'uploads/gal-1782198561385-zn9j8.png',0,'2026-06-23 07:09:21','2026-06-23 07:09:21'),(2,1,'uploads/gal-1782198561387-7mnse.png',1,'2026-06-23 07:09:21','2026-06-23 07:09:21'),(3,1,'uploads/gal-1782198561388-f3kz3.png',2,'2026-06-23 07:09:21','2026-06-23 07:09:21'),(4,1,'uploads/gal-1782198561395-qnvuv.png',3,'2026-06-23 07:09:21','2026-06-23 07:09:21'),(5,1,'uploads/gal-1782198561401-6als1.png',4,'2026-06-23 07:09:21','2026-06-23 07:09:21'),(6,2,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572729/vika-vastra/saree-prod-01.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(7,3,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572730/vika-vastra/saree-prod-02.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(8,4,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572735/vika-vastra/saree-prod-03.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(9,5,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572736/vika-vastra/saree-prod-04.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(10,6,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572736/vika-vastra/saree-prod-05.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(11,7,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572738/vika-vastra/saree-prod-06.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(12,8,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572739/vika-vastra/saree-prod-07.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(13,9,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572740/vika-vastra/saree-prod-08.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(14,10,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572741/vika-vastra/saree-prod-09.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(15,11,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572742/vika-vastra/saree-prod-10.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(16,12,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572743/vika-vastra/saree-prod-11.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(17,13,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572744/vika-vastra/saree-prod-12.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(18,14,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572745/vika-vastra/saree-prod-13.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(19,15,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572746/vika-vastra/saree-prod-14.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(20,16,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572747/vika-vastra/saree-prod-15.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(21,17,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572748/vika-vastra/saree-prod-16.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(22,18,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572749/vika-vastra/saree-prod-17.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(23,19,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572750/vika-vastra/saree-prod-18.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(24,20,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572751/vika-vastra/saree-prod-19.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45'),(25,21,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572752/vika-vastra/saree-prod-20.jpg',0,'2026-11-11 12:18:45','2026-11-11 12:18:45');
/*!40000 ALTER TABLE `productimages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `productName` varchar(255) NOT NULL,
  `mrp` decimal(10,2) NOT NULL,
  `salesPrice` decimal(10,2) NOT NULL,
  `gstType` enum('inclusive','exclusive') NOT NULL DEFAULT 'exclusive',
  `gstRate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `shortDescription` varchar(300) DEFAULT NULL,
  `longDescription` text DEFAULT NULL,
  `isNewArrival` tinyint(1) DEFAULT 0,
  `isBestSeller` tinyint(1) DEFAULT 0,
  `subCategoryId` int(11) DEFAULT NULL,
  `brandId` int(11) DEFAULT NULL,
  `colors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`colors`)),
  `sizes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`sizes`)),
  `fabrics` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fabrics`)),
  `weights` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`weights`)),
  `volumes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`volumes`)),
  `nos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`nos`)),
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `sku` varchar(64) DEFAULT NULL,
  `ages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ages`)),
  `metres` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metres`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_sku_unique` (`sku`),
  KEY `subCategoryId` (`subCategoryId`),
  KEY `brandId` (`brandId`),
  KEY `categoryId` (`categoryId`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`subCategoryId`) REFERENCES `subcategories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`brandId`) REFERENCES `brands` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `products_ibfk_3` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Silk Cotton Saree',1200.00,1000.00,'exclusive',0.00,80,'https://res.cloudinary.com/pysjajzs/image/upload/v1795415527/vika-vastra/gal-1795412260228-9ueh8.jpg','Enhance your ethnic wardrobe with this stunning saree featuring a soft texture and elegant finish.','Step into timeless elegance with this beautifully crafted saree, designed to give you a graceful and sophisticated look. Made with premium-quality fabric, it offers comfort, style, and a perfect drape for every occasion. Ideal for weddings, festivals, parties, and special celebrations.',1,1,2,NULL,'["Purple & Orange","Rust Orange","Lime Green","Crimson Red"]','[]',NULL,NULL,NULL,NULL,'2026-06-22 16:49:53','2026-11-23 05:37:42',NULL,'SAREE-003','[]','[]'),(2,'Aaradhya Crimson Kanchipuram Silk Saree',8999.00,5499.00,'inclusive',5.00,25,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572729/vika-vastra/saree-prod-01.jpg','Heirloom crimson red Kanchipuram pure silk saree with opulent golden temple zari border and rich pallu.','Woven with authentic mulberry silk and tested zari, the Aaradhya Crimson Saree captures centuries of South Indian temple artistry. Perfectly suited for weddings, muhurthams, and grand celebrations.',1,1,3,6,'["Crimson Red","Antique Gold"]','["6.3 Metres (with blouse piece)"]','["Pure Kanchipuram Mulberry Silk"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-001',NULL,NULL),(3,'Mayura Royal Emerald Soft Silk Saree',6499.00,3899.00,'inclusive',5.00,30,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572730/vika-vastra/saree-prod-02.jpg','Lustrous emerald green soft silk saree adorned with delicate peacock motifs and floral vines in zari.','Designed for seamless drape and feather-light comfort, the Mayura Emerald Soft Silk saree blends the richness of traditional weaves with modern festive elegance.',1,0,1,1,'["Emerald Green","Warm Gold"]','["6.3 Metres (with blouse piece)"]','["Soft Silk"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-002',NULL,NULL),(4,'Swarna Mustard Handloom Silk Cotton Saree',3999.00,2299.00,'inclusive',5.00,40,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572735/vika-vastra/saree-prod-03.jpg','Vibrant mustard silk cotton saree featuring contrasting rust maroon korvai borders and woven buttis.','Handcrafted by master weavers, this silk cotton saree provides breathable all-day comfort while maintaining an unmistakable festive radiance. Ideal for temple visits and family gatherings.',0,1,2,4,'["Mustard Yellow","Rust Maroon"]','["6.2 Metres (with blouse piece)"]','["Silk Cotton"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-003',NULL,NULL),(5,'Rani Pink Banarasi Katan Silk Saree',11999.00,7499.00,'inclusive',5.00,20,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572736/vika-vastra/saree-prod-04.jpg','Majestic Rani pink Banarasi silk saree with dense floral jaal weaving and kadhwa antique zari.','Handwoven on historic Varanasi looms, this bridal masterpiece radiates timeless royal splendor with intricate kadhwa weaving and a resplendent zari pallu.',1,1,4,8,'["Rani Pink","Champagne Gold"]','["6.3 Metres (with blouse piece)"]','["Pure Banarasi Katan Silk"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-004',NULL,NULL),(6,'Neelambari Midnight Blue Chanderi Saree',4799.00,2899.00,'inclusive',5.00,35,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572736/vika-vastra/saree-prod-05.jpg','Ethereal midnight blue Chanderi saree highlighted with delicate silver ashoka motifs and sheer borders.','Sheer, lightweight, and effortlessly graceful, the Neelambari Chanderi saree embodies understated sophistication for evening events and cultural soirees.',1,0,2,5,'["Midnight Blue","Silver Zari"]','["6.2 Metres (with blouse piece)"]','["Chanderi Silk Cotton"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-005',NULL,NULL),(7,'Kaveri Pastel Mint Pure Cotton Saree',2999.00,1699.00,'inclusive',5.00,50,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572738/vika-vastra/saree-prod-06.jpg','Cool mint green 100-count pure combed cotton saree with subtle woven thread borders.','Spun with ultra-fine organic cotton yarn, Kaveri provides unmatched coolness and crisp drape throughout hot summer days and office wear.',0,1,5,10,'["Mint Green","Soft Silver"]','["6.2 Metres (with blouse piece)"]','["100% Pure Organic Cotton"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-006',NULL,NULL),(8,'Vaidehi Sunset Rust Copper Zari Saree',7499.00,4499.00,'inclusive',5.00,22,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572739/vika-vastra/saree-prod-07.jpg','Contemporary rust orange soft silk drape featuring warm copper zari weaving and geometric chevron pallu.','A breathtaking fusion of traditional luster and modern earthy tones. The copper zari detailing catches the light at every turn.',1,0,1,2,'["Rust Orange","Copper Gold"]','["6.3 Metres (with blouse piece)"]','["Soft Silk"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-007',NULL,NULL),(9,'Meenakshi Royal Purple Bridal Brocade Saree',13499.00,8999.00,'inclusive',5.00,20,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572740/vika-vastra/saree-prod-08.jpg','Regal deep purple bridal brocade saree featuring all-over temple gopuram weaves in tested gold zari.','Worthy of the royal trousseau, the Meenakshi Bridal Brocade showcases heavy zari work on pure mulberry silk, complete with contrast magenta blouse.',0,1,3,7,'["Deep Purple","Pure Gold"]','["6.3 Metres (with blouse piece)"]','["Pure Kanchipuram Brocade Silk"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-008',NULL,NULL),(10,'Chitrangada Mango Yellow Temple Border Saree',5299.00,3199.00,'inclusive',5.00,28,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572741/vika-vastra/saree-prod-09.jpg','Auspicious mango yellow silk cotton saree framed by traditional bottle green temple spires.','An auspicious classic for puja, housewarmings, and festive mornings. The rich contrast border creates an iconic South Indian silhouette.',1,1,2,4,'["Mango Yellow","Bottle Green"]','["6.2 Metres (with blouse piece)"]','["Silk Cotton"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-009',NULL,NULL),(11,'Chandrika Ivory Gold Tissue Silk Saree',9499.00,5999.00,'inclusive',5.00,20,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572742/vika-vastra/saree-prod-10.jpg','Luminous ivory tissue silk saree shimmering with continuous gold warp threads and delicate scallop hem.','A dreamscape of subtle opulence. The metallic sheen of the gold tissue weave complements the ivory base for receptions and modern festive affairs.',1,0,6,12,'["Ivory White","Gilded Gold"]','["6.3 Metres (with blouse piece)"]','["Tissue Silk"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-010',NULL,NULL),(12,'Ananya Coral Peach Organza Floral Saree',4999.00,2999.00,'inclusive',5.00,32,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572743/vika-vastra/saree-prod-11.jpg','Featherweight coral peach organza saree with hand-embellished cutdana florals and scallop borders.','Airy, romantic, and breathtakingly modern. The sheer drape of pure organza is elevated with subtle handwork that sparkles delicately under evening lights.',1,1,6,13,'["Coral Peach","Rose Gold"]','["6.3 Metres (with blouse piece)"]','["Pure Sheer Organza Silk"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-011',NULL,NULL),(13,'Bhavana Maroon Pochampally Ikat Silk Saree',8299.00,4999.00,'inclusive',5.00,24,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572744/vika-vastra/saree-prod-12.jpg','Authentic Telia Rumal style Pochampally double ikat silk saree with geometric diamond motifs.','A tribute to heritage tie-and-dye weaving. The precision geometric ikat patterns on rich maroon silk bring artisanal prestige to every wardrobe.',0,1,7,15,'["Maroon","Black & White"]','["6.2 Metres (with blouse piece)"]','["Pochampally Double Ikat Silk"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-012',NULL,NULL),(14,'Harini Parrot Green Dual Tone Soft Silk Saree',5899.00,3499.00,'inclusive',5.00,30,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572745/vika-vastra/saree-prod-13.jpg','Shimmering dual-tone parrot green and turquoise soft silk saree with antique bronze zari border.','The magical shot-effect of green and blue threads shifting in light creates a vibrant, head-turning look for festive occasions and sangeets.',1,0,1,2,'["Parrot Green","Turquoise Blue"]','["6.3 Metres (with blouse piece)"]','["Dual Tone Soft Silk"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-013',NULL,NULL),(15,'Padmavathi Ruby Red Wedding Silk Saree',14999.00,9499.00,'inclusive',5.00,20,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572746/vika-vastra/saree-prod-14.jpg','Traditional bridal ruby red silk saree woven with Annapakshi bird motifs and 10-inch heavy zari border.','The quintessential South Indian bridal drape. Handwoven on double-warp looms with tested silver-dipped gold zari, guaranteed to become a cherished family heirloom.',0,1,8,16,'["Ruby Red","Antique Zari"]','["6.3 Metres (with blouse piece)"]','["Heavy Bridal Kanchipuram Silk"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-014',NULL,NULL),(16,'Lavanya Lilac Lavender Pastel Silk Saree',6799.00,3999.00,'inclusive',5.00,20,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572747/vika-vastra/saree-prod-15.jpg','Chic pastel lilac soft silk saree detailed with contemporary floral vine creepers and matte silver pallu.','Pastel perfection tailored for the modern millennial drape. The soft lilac hue effortlessly blends youthfulness with Indian classical elegance.',1,1,1,NULL,'["Lilac Lavender","Matte Silver"]','[]',NULL,NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-23 10:08:31',NULL,'VV-SAR-015','[]','[]'),(17,'Shambhavi Indigo Kalamkari Hand-Painted Saree',4499.00,2699.00,'inclusive',5.00,35,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572748/vika-vastra/saree-prod-16.jpg','Authentic Sri Kalahasti hand-painted pen Kalamkari mythological motif saree on organic cotton.','Each motif is hand-drawn using natural vegetable dyes by generational Kalamkari artisans. Wear living Indian mythological folklore with pride.',0,0,5,11,'["Natural Indigo","Beige"]','["6.2 Metres (with blouse piece)"]','["Handloom Chanderi Cotton"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-016',NULL,NULL),(18,'Tamanna Peacock Teal Tissue Brocade Saree',8799.00,5299.00,'inclusive',5.00,22,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572749/vika-vastra/saree-prod-17.jpg','Enchanting peacock teal tissue brocade saree with floral bel patterns and solid gold woven border.','A rich gemstone hue harmonized with lustrous gold brocade. Highly photogenic drape that accentuates every curve with regal dignity.',1,0,6,14,'["Peacock Teal","Golden Zari"]','["6.3 Metres (with blouse piece)"]','["Tissue Brocade Silk"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-017',NULL,NULL),(19,'Devika Black & Gold Festive Georgette Saree',5499.00,3299.00,'inclusive',5.00,28,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572750/vika-vastra/saree-prod-18.jpg','Dramatic midnight black georgette saree featuring intricate badla gold zari embroidery and scallop border.','Sensuous fluid drape meets royal Indian gold embroidery. Perfect for reception parties, sangeet nights, and cocktail celebrations.',0,1,9,17,'["Classic Black","Gilded Gold"]','["6.2 Metres (with blouse piece)"]','["Pure Viscose Georgette"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-018',NULL,NULL),(20,'Radhika Wine Burgundy Jacquard Silk Saree',7199.00,4199.00,'inclusive',5.00,25,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572751/vika-vastra/saree-prod-19.jpg','Intense wine burgundy jacquard silk saree with all-over self-weaving damask and rich bronze pallu.','The deep jewel-toned burgundy tone exudes unmatched warmth and royalty. Flawlessly complemented by antique bronze zari weave.',1,1,1,3,'["Wine Burgundy","Antique Bronze"]','["6.3 Metres (with blouse piece)"]','["Jacquard Soft Silk"]',NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-11 12:40:08',NULL,'VV-SAR-019',NULL,NULL),(21,'Sundari Traditional Chettinad Cotton Saree',2499.00,1499.00,'inclusive',5.00,90,'https://res.cloudinary.com/pysjajzs/image/upload/v1794572752/vika-vastra/saree-prod-20.jpg','Heritage Chettinad striped handloom cotton saree with bold temple rudraksh borders.','Straight from the looms of Karaikudi, this authentic Chettinad cotton saree is renowned for its thick, sturdy drape, earthy vegetable colors, and rustic timelessness.',1,1,10,NULL,'["Maroon","Mustard & Black"]','[]',NULL,NULL,NULL,NULL,'2026-11-11 12:18:45','2026-11-20 10:55:49',NULL,'VV-SAR-020','[]','[]');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productvariants`
--

DROP TABLE IF EXISTS `productvariants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productvariants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `productId` int(11) NOT NULL,
  `sku` varchar(64) DEFAULT NULL,
  `attributes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`attributes`)),
  `mrp` decimal(10,2) DEFAULT NULL,
  `salesPrice` decimal(10,2) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `productId` (`productId`),
  CONSTRAINT `productvariants_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productvariants`
--

LOCK TABLES `productvariants` WRITE;
/*!40000 ALTER TABLE `productvariants` DISABLE KEYS */;
INSERT INTO `productvariants` VALUES (120021,1,'SAREE-003-PUR','{\"Color\":\"Purple & Orange\"}',1200.00,1000.00,20,1,'2026-11-23 12:05:27','2026-11-23 12:05:27','https://res.cloudinary.com/pysjajzs/image/upload/v1795415527/vika-vastra/gal-1795412260228-9ueh8.jpg'),(120022,1,'SAREE-003-RST','{\"Color\":\"Rust Orange\"}',1200.00,1000.00,20,1,'2026-11-23 12:05:27','2026-11-23 12:05:27','https://res.cloudinary.com/pysjajzs/image/upload/v1795415528/vika-vastra/gal-1795412260229-kzuau.jpg'),(120023,1,'SAREE-003-LMG','{\"Color\":\"Lime Green\"}',1200.00,1000.00,20,1,'2026-11-23 12:05:27','2026-11-23 12:05:27','https://res.cloudinary.com/pysjajzs/image/upload/v1795415529/vika-vastra/gal-1795412260235-sfxn4.jpg'),(120024,1,'SAREE-003-RED','{\"Color\":\"Crimson Red\"}',1200.00,1000.00,20,1,'2026-11-23 12:05:27','2026-11-23 12:05:27','https://res.cloudinary.com/pysjajzs/image/upload/v1795415530/vika-vastra/gal-1795412260240-fydn6.jpg'),(180021,2,'VV-SAR-001-CLR1','{\"Color\":\"Crimson Red\"}',8999.00,5499.00,13,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572729/vika-vastra/saree-prod-01.jpg'),(180022,2,'VV-SAR-001-CLR2','{\"Color\":\"Antique Gold\"}',8999.00,5499.00,12,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572729/vika-vastra/saree-prod-01.jpg'),(180023,3,'VV-SAR-002-CLR1','{\"Color\":\"Emerald Green\"}',6499.00,3899.00,15,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572730/vika-vastra/saree-prod-02.jpg'),(180024,3,'VV-SAR-002-CLR2','{\"Color\":\"Warm Gold\"}',6499.00,3899.00,15,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572730/vika-vastra/saree-prod-02.jpg'),(180025,4,'VV-SAR-003-CLR1','{\"Color\":\"Mustard Yellow\"}',3999.00,2299.00,20,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572735/vika-vastra/saree-prod-03.jpg'),(180026,4,'VV-SAR-003-CLR2','{\"Color\":\"Rust Maroon\"}',3999.00,2299.00,20,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572735/vika-vastra/saree-prod-03.jpg'),(180027,5,'VV-SAR-004-CLR1','{\"Color\":\"Rani Pink\"}',11999.00,7499.00,10,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572736/vika-vastra/saree-prod-04.jpg'),(180028,5,'VV-SAR-004-CLR2','{\"Color\":\"Champagne Gold\"}',11999.00,7499.00,10,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572736/vika-vastra/saree-prod-04.jpg'),(180029,6,'VV-SAR-005-CLR1','{\"Color\":\"Midnight Blue\"}',4799.00,2899.00,18,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572736/vika-vastra/saree-prod-05.jpg'),(180030,6,'VV-SAR-005-CLR2','{\"Color\":\"Silver Zari\"}',4799.00,2899.00,17,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572736/vika-vastra/saree-prod-05.jpg'),(180031,7,'VV-SAR-006-CLR1','{\"Color\":\"Mint Green\"}',2999.00,1699.00,25,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572738/vika-vastra/saree-prod-06.jpg'),(180032,7,'VV-SAR-006-CLR2','{\"Color\":\"Soft Silver\"}',2999.00,1699.00,25,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572738/vika-vastra/saree-prod-06.jpg'),(180033,8,'VV-SAR-007-CLR1','{\"Color\":\"Rust Orange\"}',7499.00,4499.00,11,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572739/vika-vastra/saree-prod-07.jpg'),(180034,8,'VV-SAR-007-CLR2','{\"Color\":\"Copper Gold\"}',7499.00,4499.00,11,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572739/vika-vastra/saree-prod-07.jpg'),(180035,9,'VV-SAR-008-CLR1','{\"Color\":\"Deep Purple\"}',13499.00,8999.00,10,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572740/vika-vastra/saree-prod-08.jpg'),(180036,9,'VV-SAR-008-CLR2','{\"Color\":\"Pure Gold\"}',13499.00,8999.00,10,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572740/vika-vastra/saree-prod-08.jpg'),(180037,10,'VV-SAR-009-CLR1','{\"Color\":\"Mango Yellow\"}',5299.00,3199.00,14,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572741/vika-vastra/saree-prod-09.jpg'),(180038,10,'VV-SAR-009-CLR2','{\"Color\":\"Bottle Green\"}',5299.00,3199.00,14,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572741/vika-vastra/saree-prod-09.jpg'),(180039,11,'VV-SAR-010-CLR1','{\"Color\":\"Ivory White\"}',9499.00,5999.00,10,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572742/vika-vastra/saree-prod-10.jpg'),(180040,11,'VV-SAR-010-CLR2','{\"Color\":\"Gilded Gold\"}',9499.00,5999.00,10,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572742/vika-vastra/saree-prod-10.jpg'),(180041,12,'VV-SAR-011-CLR1','{\"Color\":\"Coral Peach\"}',4999.00,2999.00,16,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572743/vika-vastra/saree-prod-11.jpg'),(180042,12,'VV-SAR-011-CLR2','{\"Color\":\"Rose Gold\"}',4999.00,2999.00,16,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572743/vika-vastra/saree-prod-11.jpg'),(180043,13,'VV-SAR-012-CLR1','{\"Color\":\"Maroon\"}',8299.00,4999.00,12,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572744/vika-vastra/saree-prod-12.jpg'),(180044,13,'VV-SAR-012-CLR2','{\"Color\":\"Black & White\"}',8299.00,4999.00,12,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572744/vika-vastra/saree-prod-12.jpg'),(180045,14,'VV-SAR-013-CLR1','{\"Color\":\"Parrot Green\"}',5899.00,3499.00,15,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572745/vika-vastra/saree-prod-13.jpg'),(180046,14,'VV-SAR-013-CLR2','{\"Color\":\"Turquoise Blue\"}',5899.00,3499.00,15,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572745/vika-vastra/saree-prod-13.jpg'),(180047,15,'VV-SAR-014-CLR1','{\"Color\":\"Ruby Red\"}',14999.00,9499.00,10,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572746/vika-vastra/saree-prod-14.jpg'),(180048,15,'VV-SAR-014-CLR2','{\"Color\":\"Antique Zari\"}',14999.00,9499.00,10,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572746/vika-vastra/saree-prod-14.jpg'),(180049,16,'VV-SAR-015-CLR1','{\"Color\":\"Lilac Lavender\"}',6799.00,3999.00,10,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572747/vika-vastra/saree-prod-15.jpg'),(180050,16,'VV-SAR-015-CLR2','{\"Color\":\"Matte Silver\"}',6799.00,3999.00,10,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572747/vika-vastra/saree-prod-15.jpg'),(180051,17,'VV-SAR-016-CLR1','{\"Color\":\"Natural Indigo\"}',4499.00,2699.00,18,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572748/vika-vastra/saree-prod-16.jpg'),(180052,17,'VV-SAR-016-CLR2','{\"Color\":\"Beige\"}',4499.00,2699.00,17,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572748/vika-vastra/saree-prod-16.jpg'),(180053,18,'VV-SAR-017-CLR1','{\"Color\":\"Peacock Teal\"}',8799.00,5299.00,11,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572749/vika-vastra/saree-prod-17.jpg'),(180054,18,'VV-SAR-017-CLR2','{\"Color\":\"Golden Zari\"}',8799.00,5299.00,11,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572749/vika-vastra/saree-prod-17.jpg'),(180055,19,'VV-SAR-018-CLR1','{\"Color\":\"Classic Black\"}',5499.00,3299.00,14,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572750/vika-vastra/saree-prod-18.jpg'),(180056,19,'VV-SAR-018-CLR2','{\"Color\":\"Gilded Gold\"}',5499.00,3299.00,14,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572750/vika-vastra/saree-prod-18.jpg'),(180057,20,'VV-SAR-019-CLR1','{\"Color\":\"Wine Burgundy\"}',7199.00,4199.00,13,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572751/vika-vastra/saree-prod-19.jpg'),(180058,20,'VV-SAR-019-CLR2','{\"Color\":\"Antique Bronze\"}',7199.00,4199.00,12,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572751/vika-vastra/saree-prod-19.jpg'),(180059,21,'VV-SAR-020-CLR1','{\"Color\":\"Maroon\"}',2499.00,1499.00,45,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572752/vika-vastra/saree-prod-20.jpg'),(180060,21,'VV-SAR-020-CLR2','{\"Color\":\"Mustard & Black\"}',2499.00,1499.00,45,1,'2026-11-23 15:51:27','2026-11-23 15:51:27','https://res.cloudinary.com/pysjajzs/image/upload/v1794572752/vika-vastra/saree-prod-20.jpg');
/*!40000 ALTER TABLE `productvariants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promobars`
--

DROP TABLE IF EXISTS `promobars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `promobars` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `message` varchar(500) NOT NULL DEFAULT 'Pay Online & GET 10% OFF on your Purchase',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promobars`
--

LOCK TABLES `promobars` WRITE;
/*!40000 ALTER TABLE `promobars` DISABLE KEYS */;
INSERT INTO `promobars` VALUES (1,'Grand Saree Best collection Sale – Up to 50% OFF | Elegant Sarees for Every Occasion | Shop Now at Vika Vasthra | Premium Silk, Cotton & Designer Sarees Now Available',1,'2026-06-22 16:46:19','2026-11-10 07:23:53');
/*!40000 ALTER TABLE `promobars` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `returns`
--

DROP TABLE IF EXISTS `returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `returns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_phone` varchar(255) DEFAULT NULL,
  `reason` text NOT NULL,
  `status` enum('requested','approved','rejected','picked_up','received','refunded') DEFAULT 'requested',
  `return_awb_code` varchar(255) DEFAULT NULL,
  `return_courier_name` varchar(255) DEFAULT NULL,
  `refund_id` varchar(255) DEFAULT NULL,
  `refund_amount` float DEFAULT NULL,
  `refund_status` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `returns_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `returns`
--

LOCK TABLES `returns` WRITE;
/*!40000 ALTER TABLE `returns` DISABLE KEYS */;
/*!40000 ALTER TABLE `returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `feedback` text NOT NULL,
  `rating` int(11) DEFAULT 5,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `customerId` int(11) DEFAULT NULL,
  `productId` int(11) DEFAULT NULL,
  `orderId` int(11) DEFAULT NULL,
  `verifiedPurchase` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stocks`
--

DROP TABLE IF EXISTS `stocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stocks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `productName` varchar(255) NOT NULL,
  `weight` varchar(255) NOT NULL,
  `quantity` int(11) DEFAULT 0,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `productId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `productId` (`productId`),
  CONSTRAINT `stocks_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocks`
--

LOCK TABLES `stocks` WRITE;
/*!40000 ALTER TABLE `stocks` DISABLE KEYS */;
INSERT INTO `stocks` VALUES (1,'Silk Cotton Saree','Default',79,'Active',1,'2026-11-06 09:19:40','2026-11-06 09:19:40');
/*!40000 ALTER TABLE `stocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subcategories`
--

DROP TABLE IF EXISTS `subcategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subcategories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `categoryId` (`categoryId`),
  CONSTRAINT `subcategories_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subcategories`
--

LOCK TABLES `subcategories` WRITE;
/*!40000 ALTER TABLE `subcategories` DISABLE KEYS */;
INSERT INTO `subcategories` VALUES (1,'Peacock & Floral Soft Silk',1,'uploads/saree-prod-02.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08'),(2,'Dual Tone Soft Silk',1,'uploads/saree-prod-13.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08'),(3,'Self-Weave Jacquard Silk',1,'uploads/saree-prod-19.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08'),(4,'Handloom Korvai Silk Cotton',2,'uploads/saree-prod-03.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08'),(5,'Chanderi Silk Cotton',2,'uploads/saree-prod-05.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08'),(6,'Temple Border Kanchipuram',3,'uploads/saree-prod-01.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08'),(7,'Bridal Brocade Kanchipuram',3,'uploads/saree-prod-08.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08'),(8,'Katan Silk Banarasi',4,'uploads/saree-prod-04.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08'),(9,'Kadhwa Jaal Banarasi',4,'uploads/saree-prod-04.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08'),(10,'Organic Combed Cotton',5,'uploads/saree-prod-06.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08'),(11,'Kalamkari Hand-Painted Cotton',5,'uploads/saree-prod-16.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08'),(12,'Gilded Tissue Silk',6,'uploads/saree-prod-10.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08'),(13,'Sheer Floral Organza',6,'uploads/saree-prod-11.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08'),(14,'Peacock Brocade Tissue',6,'uploads/saree-prod-17.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08'),(15,'Double Ikat Handloom',7,'uploads/saree-prod-12.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08'),(16,'Muhurtham Heirloom Silk',8,'uploads/saree-prod-14.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08'),(17,'Gold Zari Viscose Georgette',9,'uploads/saree-prod-18.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08'),(18,'Chettinad Handloom Cotton',10,'uploads/saree-prod-20.jpeg','Active','2026-11-11 12:40:08','2026-11-11 12:40:08');
/*!40000 ALTER TABLE `subcategories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userlogin`
--

DROP TABLE IF EXISTS `userlogin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userlogin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userlogin`
--

LOCK TABLES `userlogin` WRITE;
/*!40000 ALTER TABLE `userlogin` DISABLE KEYS */;
/*!40000 ALTER TABLE `userlogin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@emartebuy.com','$2b$10$xACJGf9Q3XM6FzHWyCB.LeTotpNXnkuGTOsw2cipbL3d2F.j6oH4a','2026-06-22 16:33:45','2026-06-22 16:33:45'),(2,'Vikraman.k','vikram.25feb@gmail.com','$2b$10$xACJGf9Q3XM6FzHWyCB.LeTotpNXnkuGTOsw2cipbL3d2F.j6oH4a','2026-11-10 06:06:31','2026-11-10 06:06:31');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wishlists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customerId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `img` varchar(255) DEFAULT NULL,
  `price` float NOT NULL DEFAULT 0,
  `weight` varchar(255) DEFAULT NULL,
  `stock` tinyint(1) DEFAULT 1,
  `rating` float DEFAULT 4.5,
  `reviews` int(11) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `variantId` int(11) DEFAULT NULL,
  `variantAttributes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variantAttributes`)),
  PRIMARY KEY (`id`),
  KEY `productId` (`productId`),
  CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-13 18:01:01
