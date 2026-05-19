-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: hce_prueba2
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `abdomenes`
--

DROP TABLE IF EXISTS `abdomenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `abdomenes` (
  `id_abdomen` int NOT NULL AUTO_INCREMENT,
  `id_examen_fisico_segmentario` int NOT NULL,
  `blando` tinyint(1) DEFAULT '0',
  `depresible` tinyint(1) DEFAULT '0',
  `dolor_palpacion` tinyint(1) DEFAULT '0',
  `hepatomegalia` tinyint(1) DEFAULT '0',
  `esplenomegalia` tinyint(1) DEFAULT '0',
  `otros` varchar(150) DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  PRIMARY KEY (`id_abdomen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `abdomenes`
--

LOCK TABLES `abdomenes` WRITE;
/*!40000 ALTER TABLE `abdomenes` DISABLE KEYS */;
/*!40000 ALTER TABLE `abdomenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alergias`
--

DROP TABLE IF EXISTS `alergias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alergias` (
  `id_alergia` int NOT NULL AUTO_INCREMENT,
  `tipo_alergia` varchar(150) NOT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_alergia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alergias`
--

LOCK TABLES `alergias` WRITE;
/*!40000 ALTER TABLE `alergias` DISABLE KEYS */;
/*!40000 ALTER TABLE `alergias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alergias_pacientes`
--

DROP TABLE IF EXISTS `alergias_pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alergias_pacientes` (
  `id_alergia_paciente` int NOT NULL AUTO_INCREMENT,
  `reaccion` varchar(20) DEFAULT NULL,
  `observaciones` varchar(100) DEFAULT NULL,
  `id_paciente` int NOT NULL,
  `id_alergia` int NOT NULL,
  `id_antecedente_patologico_personal` int DEFAULT NULL,
  `fecha_creacion` date DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_alergia_paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alergias_pacientes`
--

LOCK TABLES `alergias_pacientes` WRITE;
/*!40000 ALTER TABLE `alergias_pacientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `alergias_pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alimentaciones`
--

DROP TABLE IF EXISTS `alimentaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alimentaciones` (
  `id_alimentacion` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(50) DEFAULT NULL,
  `tipo_lactancia` varchar(150) DEFAULT NULL,
  `edad_lactancia` varchar(50) DEFAULT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  `edad_ablactacion` varchar(50) DEFAULT NULL,
  `id_desarrollo_psicomotor` int DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_alimentacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alimentaciones`
--

LOCK TABLES `alimentaciones` WRITE;
/*!40000 ALTER TABLE `alimentaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `alimentaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `antecedentes_familiares`
--

DROP TABLE IF EXISTS `antecedentes_familiares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `antecedentes_familiares` (
  `id_antecedente_familiar` int NOT NULL AUTO_INCREMENT,
  `enfermedad_hereditaria` varchar(150) DEFAULT NULL,
  `descripcion` text,
  `fecha` date DEFAULT NULL,
  `id_enfermedad` int DEFAULT NULL,
  `id_antecedente_perinatal` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_antecedente_familiar`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `antecedentes_familiares`
--

LOCK TABLES `antecedentes_familiares` WRITE;
/*!40000 ALTER TABLE `antecedentes_familiares` DISABLE KEYS */;
/*!40000 ALTER TABLE `antecedentes_familiares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `antecedentes_inmunizaciones`
--

DROP TABLE IF EXISTS `antecedentes_inmunizaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `antecedentes_inmunizaciones` (
  `id_antecedente_inmunizacion` int NOT NULL AUTO_INCREMENT,
  `estado_vacunacion` varchar(150) DEFAULT NULL,
  `fecha_vacunacion` date DEFAULT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  `id_historia_clinica` int DEFAULT NULL,
  `id_antecedente_perinatal` int DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_antecedente_inmunizacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `antecedentes_inmunizaciones`
--

LOCK TABLES `antecedentes_inmunizaciones` WRITE;
/*!40000 ALTER TABLE `antecedentes_inmunizaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `antecedentes_inmunizaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `antecedentes_patologicos_personales`
--

DROP TABLE IF EXISTS `antecedentes_patologicos_personales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `antecedentes_patologicos_personales` (
  `id_antecedente_patologico_personal` int NOT NULL AUTO_INCREMENT,
  `id_antecedente_perinatal` int DEFAULT NULL,
  `observaciones` varchar(20) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_antecedente_patologico_personal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `antecedentes_patologicos_personales`
--

LOCK TABLES `antecedentes_patologicos_personales` WRITE;
/*!40000 ALTER TABLE `antecedentes_patologicos_personales` DISABLE KEYS */;
/*!40000 ALTER TABLE `antecedentes_patologicos_personales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `antecedentes_perinatales`
--

DROP TABLE IF EXISTS `antecedentes_perinatales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `antecedentes_perinatales` (
  `id_antecedente_perinatal` int NOT NULL AUTO_INCREMENT,
  `id_historia_clinica` int NOT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_antecedente_perinatal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `antecedentes_perinatales`
--

LOCK TABLES `antecedentes_perinatales` WRITE;
/*!40000 ALTER TABLE `antecedentes_perinatales` DISABLE KEYS */;
/*!40000 ALTER TABLE `antecedentes_perinatales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aspectos_generales`
--

DROP TABLE IF EXISTS `aspectos_generales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aspectos_generales` (
  `id_aspecto_general` int NOT NULL AUTO_INCREMENT,
  `id_examen_fisico_segmentario` int NOT NULL,
  `consciente` tinyint(1) DEFAULT '0',
  `alerta` tinyint(1) DEFAULT '0',
  `activo` tinyint(1) DEFAULT '0',
  `decaido` tinyint(1) DEFAULT '0',
  `otros` varchar(150) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  `last_modified` timestamp NULL DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `uuid_offline` varchar(36) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  PRIMARY KEY (`id_aspecto_general`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aspectos_generales`
--

LOCK TABLES `aspectos_generales` WRITE;
/*!40000 ALTER TABLE `aspectos_generales` DISABLE KEYS */;
/*!40000 ALTER TABLE `aspectos_generales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cabezas_cuellos`
--

DROP TABLE IF EXISTS `cabezas_cuellos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cabezas_cuellos` (
  `id_cabeza_cuello` int NOT NULL AUTO_INCREMENT,
  `id_examen_fisico_segmentario` int NOT NULL,
  `frontanelo_anterior` varchar(100) DEFAULT NULL,
  `adenopatia` varchar(100) DEFAULT NULL,
  `otros` varchar(150) DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  PRIMARY KEY (`id_cabeza_cuello`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cabezas_cuellos`
--

LOCK TABLES `cabezas_cuellos` WRITE;
/*!40000 ALTER TABLE `cabezas_cuellos` DISABLE KEYS */;
/*!40000 ALTER TABLE `cabezas_cuellos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cantones`
--

DROP TABLE IF EXISTS `cantones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cantones` (
  `id_canton` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) DEFAULT NULL,
  `nombre` varchar(150) NOT NULL,
  `id_provincia` int NOT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_canton`)
) ENGINE=InnoDB AUTO_INCREMENT=458 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cantones`
--

LOCK TABLES `cantones` WRITE;
/*!40000 ALTER TABLE `cantones` DISABLE KEYS */;
INSERT INTO `cantones` VALUES (1,'8','La Concordia',8,NULL,'PENDING',NULL,NULL),(2,'2','La Libertad',24,NULL,'PENDING',NULL,NULL),(3,'13','Quinsaloma',12,NULL,'PENDING',NULL,NULL),(4,'3','Salinas',24,NULL,'PENDING',NULL,NULL),(5,'1','Santa Elena',24,NULL,'PENDING',NULL,NULL),(6,'1','Santo Domingo',23,NULL,'PENDING',NULL,NULL),(7,'1','Las Golondrinas',90,NULL,'PENDING',NULL,NULL),(8,'3','Manga Del Cura',90,NULL,'PENDING',NULL,NULL),(9,'4','El Piedrero',90,NULL,'PENDING',NULL,NULL),(10,'1','Machala',7,NULL,'PENDING',NULL,NULL),(11,'2','Arenillas',7,NULL,'PENDING',NULL,NULL),(12,'3','Atahualpa',7,NULL,'PENDING',NULL,NULL),(13,'4','Balsas',7,NULL,'PENDING',NULL,NULL),(14,'5','Chilla',7,NULL,'PENDING',NULL,NULL),(15,'1','Cuenca',1,NULL,'PENDING',NULL,NULL),(16,'2','Giron',1,NULL,'PENDING',NULL,NULL),(17,'3','Gualaceo',1,NULL,'PENDING',NULL,NULL),(18,'4','Nabon',1,NULL,'PENDING',NULL,NULL),(19,'5','Paute',1,NULL,'PENDING',NULL,NULL),(20,'6','Pucará',1,NULL,'PENDING',NULL,NULL),(21,'7','San Fernando',1,NULL,'PENDING',NULL,NULL),(22,'8','Santa Isabel',1,NULL,'PENDING',NULL,NULL),(23,'9','Sigsig',1,NULL,'PENDING',NULL,NULL),(24,'1','Azogues',3,NULL,'PENDING',NULL,NULL),(25,'2','Biblián',3,NULL,'PENDING',NULL,NULL),(26,'3','Cañar',3,NULL,'PENDING',NULL,NULL),(27,'4','La Troncal',3,NULL,'PENDING',NULL,NULL),(28,'1','Morona',14,NULL,'PENDING',NULL,NULL),(29,'2','Gualaquiza',14,NULL,'PENDING',NULL,NULL),(30,'3','Limon-Indanza',14,NULL,'PENDING',NULL,NULL),(31,'4','Palora',14,NULL,'PENDING',NULL,NULL),(32,'5','Santiago',14,NULL,'PENDING',NULL,NULL),(33,'6','Sucúa',14,NULL,'PENDING',NULL,NULL),(34,'1','Guaranda',2,NULL,'PENDING',NULL,NULL),(35,'2','Chillanes',2,NULL,'PENDING',NULL,NULL),(36,'3','Chimbo',2,NULL,'PENDING',NULL,NULL),(37,'4','Echeandía',2,NULL,'PENDING',NULL,NULL),(38,'5','San Miguel',2,NULL,'PENDING',NULL,NULL),(39,'6','Caluma',2,NULL,'PENDING',NULL,NULL),(40,'7','Las Naves',2,NULL,'PENDING',NULL,NULL),(41,'1','Tulcán',4,NULL,'PENDING',NULL,NULL),(42,'2','Bolívar',4,NULL,'PENDING',NULL,NULL),(43,'3','Espejo',4,NULL,'PENDING',NULL,NULL),(44,'4','Mira',4,NULL,'PENDING',NULL,NULL),(45,'5','Montúfar',4,NULL,'PENDING',NULL,NULL),(46,'6','San Pedro de Huaca',4,NULL,'PENDING',NULL,NULL),(47,'1','Latacunga',5,NULL,'PENDING',NULL,NULL),(48,'2','La Maná',5,NULL,'PENDING',NULL,NULL),(49,'3','Pangua',5,NULL,'PENDING',NULL,NULL),(50,'4','Pujilí',5,NULL,'PENDING',NULL,NULL),(51,'5','Salcedo',5,NULL,'PENDING',NULL,NULL),(52,'6','Saquisilí',5,NULL,'PENDING',NULL,NULL),(53,'7','Sigchos',5,NULL,'PENDING',NULL,NULL),(54,'1','Riobamba',6,NULL,'PENDING',NULL,NULL),(55,'2','Alausí',6,NULL,'PENDING',NULL,NULL),(56,'3','Colta',6,NULL,'PENDING',NULL,NULL),(57,'4','Chambo',6,NULL,'PENDING',NULL,NULL),(58,'5','Chunchi',6,NULL,'PENDING',NULL,NULL),(59,'6','Guamote',6,NULL,'PENDING',NULL,NULL),(60,'7','Guano',6,NULL,'PENDING',NULL,NULL),(61,'8','Pallatanga',6,NULL,'PENDING',NULL,NULL),(62,'9','Penipe',6,NULL,'PENDING',NULL,NULL),(63,'10','Cumandá',6,NULL,'PENDING',NULL,NULL),(64,'1','Esmeraldas',8,NULL,'PENDING',NULL,NULL),(65,'2','Eloy Alfaro',8,NULL,'PENDING',NULL,NULL),(66,'3','Muisne',8,NULL,'PENDING',NULL,NULL),(67,'4','Quinindé',8,NULL,'PENDING',NULL,NULL),(68,'5','San Lorenzo',8,NULL,'PENDING',NULL,NULL),(69,'6','Atacames',8,NULL,'PENDING',NULL,NULL),(70,'1','Guayaquil',9,NULL,'PENDING',NULL,NULL),(71,'2','Alfredo Baquerizo Moreno',9,NULL,'PENDING',NULL,NULL),(72,'3','Balao',9,NULL,'PENDING',NULL,NULL),(73,'4','Balzar',9,NULL,'PENDING',NULL,NULL),(74,'5','Colimes',9,NULL,'PENDING',NULL,NULL),(75,'6','Daule',9,NULL,'PENDING',NULL,NULL),(76,'7','Duran',9,NULL,'PENDING',NULL,NULL),(77,'8','El Empalme',9,NULL,'PENDING',NULL,NULL),(78,'9','El Triunfo',9,NULL,'PENDING',NULL,NULL),(79,'10','Milagro',9,NULL,'PENDING',NULL,NULL),(80,'11','Naranjal',9,NULL,'PENDING',NULL,NULL),(81,'12','Naranjito',9,NULL,'PENDING',NULL,NULL),(82,'13','Palestina',9,NULL,'PENDING',NULL,NULL),(83,'14','Pedro Carbo',9,NULL,'PENDING',NULL,NULL),(84,'15','Salinas',9,NULL,'PENDING',NULL,NULL),(85,'16','Sanborondón',9,NULL,'PENDING',NULL,NULL),(86,'17','Santa Elena',9,NULL,'PENDING',NULL,NULL),(87,'18','Santa Lucía',9,NULL,'PENDING',NULL,NULL),(88,'19','Urbina Jado',9,NULL,'PENDING',NULL,NULL),(89,'20','Yaguachi',9,NULL,'PENDING',NULL,NULL),(90,'21','Playas',9,NULL,'PENDING',NULL,NULL),(91,'22','Simón Bolívar',9,NULL,'PENDING',NULL,NULL),(92,'23','Coronel Marcelino Maridueña',9,NULL,'PENDING',NULL,NULL),(93,'24','Lomas de Sargentillo',9,NULL,'PENDING',NULL,NULL),(94,'25','Nobol',9,NULL,'PENDING',NULL,NULL),(95,'26','La Libertad',9,NULL,'PENDING',NULL,NULL),(96,'27','General Antonio Elizalde',9,NULL,'PENDING',NULL,NULL),(97,'1','Ibarra',10,NULL,'PENDING',NULL,NULL),(98,'2','Antonio Ante',10,NULL,'PENDING',NULL,NULL),(99,'3','Cotacachi',10,NULL,'PENDING',NULL,NULL),(100,'4','Otavalo',10,NULL,'PENDING',NULL,NULL),(101,'5','Pimampiro',10,NULL,'PENDING',NULL,NULL),(102,'6','San Miguel de Urcuquí',10,NULL,'PENDING',NULL,NULL),(103,'1','Loja',11,NULL,'PENDING',NULL,NULL),(104,'2','Calvas',11,NULL,'PENDING',NULL,NULL),(105,'3','Catamayo',11,NULL,'PENDING',NULL,NULL),(106,'4','Celica',11,NULL,'PENDING',NULL,NULL),(107,'5','Chaguarpamba',11,NULL,'PENDING',NULL,NULL),(108,'6','Espíndola',11,NULL,'PENDING',NULL,NULL),(109,'7','Gonzanamá',11,NULL,'PENDING',NULL,NULL),(110,'8','Macará',11,NULL,'PENDING',NULL,NULL),(111,'9','Paltas',11,NULL,'PENDING',NULL,NULL),(112,'10','Puyango',11,NULL,'PENDING',NULL,NULL),(113,'11','Saraguro',11,NULL,'PENDING',NULL,NULL),(114,'12','Sozoranga',11,NULL,'PENDING',NULL,NULL),(115,'13','Zapotillo',11,NULL,'PENDING',NULL,NULL),(116,'14','Pindal',11,NULL,'PENDING',NULL,NULL),(117,'15','Quilanga',11,NULL,'PENDING',NULL,NULL),(118,'1','Babahoyo',12,NULL,'PENDING',NULL,NULL),(119,'2','Baba',12,NULL,'PENDING',NULL,NULL),(120,'3','Montalvo',12,NULL,'PENDING',NULL,NULL),(121,'4','Puebloviejo',12,NULL,'PENDING',NULL,NULL),(122,'5','Quevedo',12,NULL,'PENDING',NULL,NULL),(123,'6','Urdaneta',12,NULL,'PENDING',NULL,NULL),(124,'7','Ventanas',12,NULL,'PENDING',NULL,NULL),(125,'8','Vinces',12,NULL,'PENDING',NULL,NULL),(126,'9','Palenque',12,NULL,'PENDING',NULL,NULL),(127,'10','Buena Fé',12,NULL,'PENDING',NULL,NULL),(128,'11','Valencia',12,NULL,'PENDING',NULL,NULL),(129,'1','Portoviejo',13,NULL,'PENDING',NULL,NULL),(130,'2','Bolívar',13,NULL,'PENDING',NULL,NULL),(131,'3','Chone',13,NULL,'PENDING',NULL,NULL),(132,'4','El Carmen',13,NULL,'PENDING',NULL,NULL),(133,'5','Flavio Alfaro',13,NULL,'PENDING',NULL,NULL),(134,'6','Jipijapa',13,NULL,'PENDING',NULL,NULL),(135,'7','Junín',13,NULL,'PENDING',NULL,NULL),(136,'8','Manta',13,NULL,'PENDING',NULL,NULL),(137,'9','Montecristi',13,NULL,'PENDING',NULL,NULL),(138,'10','Paján',13,NULL,'PENDING',NULL,NULL),(139,'11','Pichincha',13,NULL,'PENDING',NULL,NULL),(140,'12','Rocafuerte',13,NULL,'PENDING',NULL,NULL),(141,'13','Santa Ana',13,NULL,'PENDING',NULL,NULL),(142,'14','Sucre',13,NULL,'PENDING',NULL,NULL),(143,'15','Tosagua',13,NULL,'PENDING',NULL,NULL),(144,'16','24 de Mayo',13,NULL,'PENDING',NULL,NULL),(145,'17','Pedernales',13,NULL,'PENDING',NULL,NULL),(146,'18','Olmedo',13,NULL,'PENDING',NULL,NULL),(147,'19','Puerto López',13,NULL,'PENDING',NULL,NULL),(148,'1','Tena',15,NULL,'PENDING',NULL,NULL),(149,'2','Aguarico',15,NULL,'PENDING',NULL,NULL),(150,'3','Archidona',15,NULL,'PENDING',NULL,NULL),(151,'4','El Chaco',15,NULL,'PENDING',NULL,NULL),(152,'5','La Joya de los Sachas',15,NULL,'PENDING',NULL,NULL),(153,'6','Orellana',15,NULL,'PENDING',NULL,NULL),(154,'7','Quijos',15,NULL,'PENDING',NULL,NULL),(155,'8','Loreto',15,NULL,'PENDING',NULL,NULL),(156,'1','Pastaza',16,NULL,'PENDING',NULL,NULL),(157,'2','Mera',16,NULL,'PENDING',NULL,NULL),(158,'3','Santa Clara',16,NULL,'PENDING',NULL,NULL),(159,'1','Quito',17,NULL,'PENDING',NULL,NULL),(160,'2','Cayambe',17,NULL,'PENDING',NULL,NULL),(161,'3','Mejía',17,NULL,'PENDING',NULL,NULL),(162,'4','Pedro Moncayo',17,NULL,'PENDING',NULL,NULL),(163,'5','Rumiñahui',17,NULL,'PENDING',NULL,NULL),(164,'6','Santo Domingo',17,NULL,'PENDING',NULL,NULL),(165,'7','San Miguel de los Bancos',17,NULL,'PENDING',NULL,NULL),(166,'8','Pedro Vicente Maldonado',17,NULL,'PENDING',NULL,NULL),(167,'9','Puerto Quito',17,NULL,'PENDING',NULL,NULL),(168,'1','Ambato',18,NULL,'PENDING',NULL,NULL),(169,'2','Baños',18,NULL,'PENDING',NULL,NULL),(170,'3','Cevallos',18,NULL,'PENDING',NULL,NULL),(171,'4','Mocha',18,NULL,'PENDING',NULL,NULL),(172,'5','Patate',18,NULL,'PENDING',NULL,NULL),(173,'6','Quero',18,NULL,'PENDING',NULL,NULL),(174,'7','San Pedro de Pelileo',18,NULL,'PENDING',NULL,NULL),(175,'8','Tisaleo',18,NULL,'PENDING',NULL,NULL),(176,'1','Zamora',19,NULL,'PENDING',NULL,NULL),(177,'2','Chinchipe',19,NULL,'PENDING',NULL,NULL),(178,'3','Nangaritza',19,NULL,'PENDING',NULL,NULL),(179,'4','Yacuambi',19,NULL,'PENDING',NULL,NULL),(180,'5','Yantzaza',19,NULL,'PENDING',NULL,NULL),(181,'6','El Pangui',19,NULL,'PENDING',NULL,NULL),(182,'7','Centinela del Condor',19,NULL,'PENDING',NULL,NULL),(183,'1','San Cristóbal',20,NULL,'PENDING',NULL,NULL),(184,'2','Isabela',20,NULL,'PENDING',NULL,NULL),(185,'3','Santa Cruz',20,NULL,'PENDING',NULL,NULL),(186,'1','Lago Agrio',21,NULL,'PENDING',NULL,NULL),(187,'2','Gonzalo Pizarro',21,NULL,'PENDING',NULL,NULL),(188,'3','Putumayo',21,NULL,'PENDING',NULL,NULL),(189,'4','Shushufindi',21,NULL,'PENDING',NULL,NULL),(190,'5','Sucumbios',21,NULL,'PENDING',NULL,NULL),(191,'6','Cascales',21,NULL,'PENDING',NULL,NULL),(192,'6','El Guabo',7,NULL,'PENDING',NULL,NULL),(193,'7','Huaquillas',7,NULL,'PENDING',NULL,NULL),(194,'8','Marcabelí',7,NULL,'PENDING',NULL,NULL),(195,'9','Pasaje',7,NULL,'PENDING',NULL,NULL),(196,'10','Piñas',7,NULL,'PENDING',NULL,NULL),(197,'11','Portovelo',7,NULL,'PENDING',NULL,NULL),(198,'12','Santa Rosa',7,NULL,'PENDING',NULL,NULL),(199,'13','Zaruma',7,NULL,'PENDING',NULL,NULL),(200,'14','Las Lajas',7,NULL,'PENDING',NULL,NULL),(201,'10','Oña',1,NULL,'PENDING',NULL,NULL),(202,'11','Chordeleg',1,NULL,'PENDING',NULL,NULL),(203,'12','El Pan',1,NULL,'PENDING',NULL,NULL),(204,'13','Sevilla de Oro',1,NULL,'PENDING',NULL,NULL),(205,'14','Guachapala',1,NULL,'PENDING',NULL,NULL),(206,'5','El Tambo',3,NULL,'PENDING',NULL,NULL),(207,'6','Déleg',3,NULL,'PENDING',NULL,NULL),(208,'7','Huamboya',14,NULL,'PENDING',NULL,NULL),(209,'8','San Juan Bosco',14,NULL,'PENDING',NULL,NULL),(210,'15','Camilo Ponce Enriquez',1,NULL,'PENDING',NULL,NULL),(211,'7','Suscal',3,NULL,'PENDING',NULL,NULL),(212,'7','Rioverde',8,NULL,'PENDING',NULL,NULL),(213,'28','Isidro Ayora',9,NULL,'PENDING',NULL,NULL),(214,'16','Olmedo',11,NULL,'PENDING',NULL,NULL),(215,'12','Mocache',12,NULL,'PENDING',NULL,NULL),(216,'20','Jama',13,NULL,'PENDING',NULL,NULL),(217,'21','Jaramijó',13,NULL,'PENDING',NULL,NULL),(218,'22','San Vicente',13,NULL,'PENDING',NULL,NULL),(219,'9','Taisha',14,NULL,'PENDING',NULL,NULL),(220,'10','Logroño',14,NULL,'PENDING',NULL,NULL),(221,'11','Pablo VI',14,NULL,'PENDING',NULL,NULL),(222,'12','Twintza',14,NULL,'PENDING',NULL,NULL),(223,'9','Carlos Julio Arosemena',15,NULL,'PENDING',NULL,NULL),(224,'4','Arajuno',16,NULL,'PENDING',NULL,NULL),(225,'9','Santiago de Pillaro',18,NULL,'PENDING',NULL,NULL),(226,'8','Palanda',19,NULL,'PENDING',NULL,NULL),(227,'9','Paquisha',19,NULL,'PENDING',NULL,NULL),(228,'7','Cuyabeno',21,NULL,'PENDING',NULL,NULL),(229,'1','Orellana',22,NULL,'PENDING',NULL,NULL),(230,'2','Aguarico',22,NULL,'PENDING',NULL,NULL),(231,'3','La Joya de los Sachas',22,NULL,'PENDING',NULL,NULL),(232,'4','Loreto',22,NULL,'PENDING',NULL,NULL),(233,'29','Salitre',9,NULL,'PENDING',NULL,NULL),(234,'1','Extranjero',99,NULL,'PENDING',NULL,NULL),(235,NULL,'Cuenca',1,'28d1241a-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(236,NULL,'Girón',1,'28d2dc0a-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(237,NULL,'Gualaceo',1,'28d2e08c-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(238,NULL,'Nabón',1,'28d2e11d-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(239,NULL,'Paute',1,'28d2e1bb-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(240,NULL,'Pucará',1,'28d2e237-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(241,NULL,'San Fernando',1,'28d2e2b3-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(242,NULL,'Santa Isabel',1,'28d2e32f-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(243,NULL,'Sigsig',1,'28d2e3a9-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(244,NULL,'Oña',1,'28d2e41d-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(245,NULL,'Chordeleg',1,'28d2e491-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(246,NULL,'El Pan',1,'28d2e504-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(247,NULL,'Sevilla de Oro',1,'28d2e5bd-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(248,NULL,'Guachapala',1,'28d2e650-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(249,NULL,'Camilo Ponce Enriquez',1,'28d2e6c8-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(250,NULL,'Guaranda',2,'28d6147c-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(251,NULL,'Chillanes',2,'28d6483b-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(252,NULL,'Chimbo',2,'28d64a10-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(253,NULL,'Echeandía',2,'28d64a9a-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(254,NULL,'San Miguel',2,'28d64b0c-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(255,NULL,'Caluma',2,'28d64b7e-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(256,NULL,'Las Naves',2,'28d64bf5-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(257,NULL,'Azogues',3,'28d767bf-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(258,NULL,'Biblián',3,'28d7895f-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(259,NULL,'Cañar',3,'28d78b39-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(260,NULL,'La Troncal',3,'28d78b9c-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(261,NULL,'El Tambo',3,'28d78bfc-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(262,NULL,'Déleg',3,'28d78c52-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(263,NULL,'Suscal',3,'28d79d78-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(264,NULL,'Tulcán',4,'28d8cebd-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(265,NULL,'Bolívar',4,'28d946fe-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(266,NULL,'Espejo',4,'28d94893-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(267,NULL,'Mira',4,'28d94914-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(268,NULL,'Montúfar',4,'28d94987-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(269,NULL,'San Pedro de Huaca',4,'28d94a51-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(270,NULL,'Latacunga',5,'28dac5d1-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(271,NULL,'La Maná',5,'28daedcf-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(272,NULL,'Pangua',5,'28daefc1-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(273,NULL,'Pujilí',5,'28daf062-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(274,NULL,'Salcedo',5,'28daf0e5-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(275,NULL,'Saquisilí',5,'28daf162-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(276,NULL,'Sigchos',5,'28daf1e9-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(277,NULL,'Riobamba',6,'28dc288d-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(278,NULL,'Alausí',6,'28dc40c6-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(279,NULL,'Colta',6,'28dc42f4-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(280,NULL,'Chambo',6,'28dc438c-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(281,NULL,'Chunchi',6,'28dc4420-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(282,NULL,'Guamote',6,'28ddf238-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(283,NULL,'Guano',6,'28ddf42e-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(284,NULL,'Pallatanga',6,'28ddf496-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(285,NULL,'Penipe',6,'28ddf510-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(286,NULL,'Cumandá',6,'28ddf574-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(287,NULL,'Machala',7,'28df186f-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(288,NULL,'Arenillas',7,'28df24f3-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(289,NULL,'Atahualpa',7,'28df26ac-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(290,NULL,'Balsas',7,'28df2739-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(291,NULL,'Chilla',7,'28df27bb-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(292,NULL,'El Guabo',7,'28df283a-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(293,NULL,'Huaquillas',7,'28df28bd-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(294,NULL,'Marcabelí',7,'28df2948-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(295,NULL,'Pasaje',7,'28df29ba-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(296,NULL,'Piñas',7,'28df2a2e-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(297,NULL,'Portovelo',7,'28df2afa-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(298,NULL,'Santa Rosa',7,'28df2b7a-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(299,NULL,'Zaruma',7,'28df2c05-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(300,NULL,'Las Lajas',7,'28df2c7a-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(301,NULL,'Esmeraldas',8,'28e03ed5-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(302,NULL,'Eloy Alfaro',8,'28e0477a-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(303,NULL,'Muisne',8,'28e048dc-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(304,NULL,'Quinindé',8,'28e04958-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(305,NULL,'San Lorenzo',8,'28e049dd-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(306,NULL,'Atacames',8,'28e04a5b-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(307,NULL,'Rioverde',8,'28e04ad4-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(308,NULL,'Guayaquil',9,'28e176f2-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(309,NULL,'Alfredo Baquerizo Moreno',9,'28e17fdf-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(310,NULL,'Balao',9,'28e18122-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(311,NULL,'Balzar',9,'28e181e2-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(312,NULL,'Colimes',9,'28e182ae-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(313,NULL,'Daule',9,'28e1832f-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(314,NULL,'Duran',9,'28e183a9-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(315,NULL,'El Empalme',9,'28e18424-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(316,NULL,'El Triunfo',9,'28e18499-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(317,NULL,'Milagro',9,'28e18513-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(318,NULL,'Naranjal',9,'28e1858f-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(319,NULL,'Naranjito',9,'28e1863d-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(320,NULL,'Palestina',9,'28e18726-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(321,NULL,'Pedro Carbo',9,'28e187aa-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(322,NULL,'Sanborondón',9,'28e1881d-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(323,NULL,'Santa Lucía',9,'28e18895-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(324,NULL,'Urbina Jado',9,'28e18932-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(325,NULL,'Yaguachi',9,'28e189b1-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(326,NULL,'Playas',9,'28e18a29-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(327,NULL,'Simón Bolívar',9,'28e18cc1-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(328,NULL,'Coronel Marcelino Maridueña',9,'28e18e1d-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(329,NULL,'Lomas de Sargentillo',9,'28e18ec3-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(330,NULL,'Nobol',9,'28e18fa9-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(331,NULL,'General Antonio Elizalde',9,'28e19029-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(332,NULL,'Salitre',9,'28e190a5-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(333,NULL,'Isidro Ayora',9,'28e19121-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(334,NULL,'El Piedrero',9,'28e1919e-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(335,NULL,'Ibarra',10,'28e2e7d3-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(336,NULL,'Antonio Ante',10,'28e2efbf-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(337,NULL,'Cotacachi',10,'28e2f0d3-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(338,NULL,'Otavalo',10,'28e2f14a-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(339,NULL,'Pimampiro',10,'28e2f1b4-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(340,NULL,'San Miguel de Urcuquí',10,'28e2f22d-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(341,NULL,'Las Golondrinas',10,'28e2f2a3-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(342,NULL,'Loja',11,'28e42fb4-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(343,NULL,'Calvas',11,'28e44cba-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(344,NULL,'Catamayo',11,'28e44e71-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(345,NULL,'Celica',11,'28e44efa-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(346,NULL,'Chaguarpamba',11,'28e44f77-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(347,NULL,'Espíndola',11,'28e44ff1-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(348,NULL,'Gonzanamá',11,'28e45065-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(349,NULL,'Macará',11,'28e450d8-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(350,NULL,'Paltas',11,'28e45150-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(351,NULL,'Puyango',11,'28e451c3-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(352,NULL,'Saraguro',11,'28e45230-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(353,NULL,'Sozoranga',11,'28e452d2-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(354,NULL,'Zapotillo',11,'28e45344-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(355,NULL,'Pindal',11,'28e453b3-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(356,NULL,'Quilanga',11,'28e45424-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(357,NULL,'Olmedo',11,'28e45496-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(358,NULL,'Babahoyo',12,'28e582d2-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(359,NULL,'Baba',12,'28e5892d-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(360,NULL,'Montalvo',12,'28e589ac-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(361,NULL,'Puebloviejo',12,'28e58a11-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(362,NULL,'Quevedo',12,'28e58a6e-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(363,NULL,'Urdaneta',12,'28e5c97e-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(364,NULL,'Ventanas',12,'28e5cad9-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(365,NULL,'Vinces',12,'28e5cb3c-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(366,NULL,'Palenque',12,'28e5cb96-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(367,NULL,'Buena Fé',12,'28e5cc2e-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(368,NULL,'Valencia',12,'28e5cc90-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(369,NULL,'Mocache',12,'28e5ccec-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(370,NULL,'Quinsaloma',12,'28e5cd4b-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(371,NULL,'Portoviejo',13,'28e6e642-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(372,NULL,'Chone',13,'28e6ed50-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(373,NULL,'El Carmen',13,'28e6eddf-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(374,NULL,'Flavio Alfaro',13,'28e6ee55-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(375,NULL,'Jipijapa',13,'28e6eecd-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(376,NULL,'Junín',13,'28e6ef5c-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(377,NULL,'Manta',13,'28e6efd7-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(378,NULL,'Montecristi',13,'28e6f03a-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(379,NULL,'Paján',13,'28e6f093-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(380,NULL,'Pichincha',13,'28e6f0e9-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(381,NULL,'Rocafuerte',13,'28e6f140-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(382,NULL,'Santa Ana',13,'28e6f196-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(383,NULL,'Sucre',13,'28e6f1ec-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(384,NULL,'Tosagua',13,'28e6f241-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(385,NULL,'24 de Mayo',13,'28e6f298-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(386,NULL,'Pedernales',13,'28e6f2f3-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(387,NULL,'Puerto López',13,'28e6f35a-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(388,NULL,'Jama',13,'28e6f3b9-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(389,NULL,'Jaramijó',13,'28e6f414-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(390,NULL,'San Vicente',13,'28e6f473-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(391,NULL,'Manga Del Cura',13,'28e6f4c7-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(392,NULL,'Morona',14,'28e810e9-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(393,NULL,'Gualaquiza',14,'28e818e9-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(394,NULL,'Limon-Indanza',14,'28e819d6-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(395,NULL,'Palora',14,'28e81a5f-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(396,NULL,'Santiago',14,'28e81adc-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(397,NULL,'Sucúa',14,'28e81b53-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(398,NULL,'Huamboya',14,'28e81bd0-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(399,NULL,'San Juan Bosco',14,'28e81c48-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(400,NULL,'Taisha',14,'28e81cc3-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(401,NULL,'Logroño',14,'28e81d42-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(402,NULL,'Pablo VI',14,'28e81dc0-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(403,NULL,'Twintza',14,'28e81e28-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(404,NULL,'Tena',15,'28e928dd-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(405,NULL,'Archidona',15,'28e9302e-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(406,NULL,'El Chaco',15,'28e930db-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(407,NULL,'Quijos',15,'28e9313c-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(408,NULL,'Carlos Julio Arosemena',15,'28e93194-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(409,NULL,'Pastaza',16,'28ea1665-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(410,NULL,'Mera',16,'28ea2ada-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(411,NULL,'Santa Clara',16,'28ea2c82-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(412,NULL,'Arajuno',16,'28ea2cec-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(413,NULL,'Quito',17,'28eb3203-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(414,NULL,'Cayambe',17,'28eb6939-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(415,NULL,'Mejía',17,'28eb6a9c-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(416,NULL,'Pedro Moncayo',17,'28eb6b02-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(417,NULL,'Rumiñahui',17,'28eb6b60-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(418,NULL,'San Miguel de los Bancos',17,'28eb6bc4-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(419,NULL,'Pedro Vicente Maldonado',17,'28eb6c29-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(420,NULL,'Puerto Quito',17,'28eb6c83-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(421,NULL,'Ambato',18,'28ec7c1d-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(422,NULL,'Baños',18,'28ec8f36-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(423,NULL,'Cevallos',18,'28ec9074-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(424,NULL,'Mocha',18,'28ec90d7-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(425,NULL,'Patate',18,'28ec9130-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(426,NULL,'Quero',18,'28ec9193-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(427,NULL,'San Pedro de Pelileo',18,'28ec91ed-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(428,NULL,'Tisaleo',18,'28ec924b-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(429,NULL,'Santiago de Pillaro',18,'28ec92a3-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(430,NULL,'Zamora',19,'28ed9fb8-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(431,NULL,'Chinchipe',19,'28eda71c-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(432,NULL,'Nangaritza',19,'28eda79b-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(433,NULL,'Yacuambi',19,'28eda7f5-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(434,NULL,'Yantzaza',19,'28eda859-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(435,NULL,'El Pangui',19,'28eda8b1-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(436,NULL,'Centinela del Condor',19,'28eda93f-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(437,NULL,'Palanda',19,'28eda997-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(438,NULL,'Paquisha',19,'28edaa1c-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(439,NULL,'San Cristóbal',20,'28eeb0b4-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(440,NULL,'Isabela',20,'28eeb767-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(441,NULL,'Santa Cruz',20,'28eeb81a-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(442,NULL,'Lago Agrio',21,'28efbb6f-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(443,NULL,'Gonzalo Pizarro',21,'28efc18f-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(444,NULL,'Putumayo',21,'28efc20f-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(445,NULL,'Shushufindi',21,'28efc26d-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(446,NULL,'Sucumbios',21,'28efc2cb-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(447,NULL,'Cascales',21,'28efc324-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(448,NULL,'Cuyabeno',21,'28efc377-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(449,NULL,'Orellana',22,'28f0b652-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(450,NULL,'Aguarico',22,'28f0e0d3-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(451,NULL,'La Joya de los Sachas',22,'28f0e2a9-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(452,NULL,'Loreto',22,'28f0e310-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(453,NULL,'Santo Domingo',23,'28f1e602-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(454,NULL,'La Concordia',23,'28f1ed01-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(455,NULL,'Santa Elena',24,'28f2e5c0-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(456,NULL,'La Libertad',24,'28f2f770-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL),(457,NULL,'Salinas',24,'28f2f8f1-fa86-11f0-b60b-0a0027000003','PENDING',NULL,NULL);
/*!40000 ALTER TABLE `cantones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cardiospulmonares`
--

DROP TABLE IF EXISTS `cardiospulmonares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cardiospulmonares` (
  `id_cardio_pulmonar` int NOT NULL AUTO_INCREMENT,
  `id_examen_fisico_segmentario` int NOT NULL,
  `ruido_cardiaco` varchar(100) DEFAULT NULL,
  `murmullo_vesicular` varchar(100) DEFAULT NULL,
  `soplos` varchar(100) DEFAULT NULL,
  `crepitante` varchar(100) DEFAULT NULL,
  `otros` varchar(150) DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  PRIMARY KEY (`id_cardio_pulmonar`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cardiospulmonares`
--

LOCK TABLES `cardiospulmonares` WRITE;
/*!40000 ALTER TABLE `cardiospulmonares` DISABLE KEYS */;
/*!40000 ALTER TABLE `cardiospulmonares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cirugias_previas`
--

DROP TABLE IF EXISTS `cirugias_previas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cirugias_previas` (
  `id_cirugia_previa` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(200) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `id_antecedente_patologico_personal` int NOT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  `id_paciente` int DEFAULT NULL,
  PRIMARY KEY (`id_cirugia_previa`),
  KEY `fk_cirugias_paciente` (`id_paciente`),
  CONSTRAINT `fk_cirugias_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cirugias_previas`
--

LOCK TABLES `cirugias_previas` WRITE;
/*!40000 ALTER TABLE `cirugias_previas` DISABLE KEYS */;
/*!40000 ALTER TABLE `cirugias_previas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complicaciones_perinatales`
--

DROP TABLE IF EXISTS `complicaciones_perinatales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complicaciones_perinatales` (
  `id_complicacion_perinatal` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(150) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `id_dato_gestacional` int NOT NULL,
  `id_enfermedad` int DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_complicacion_perinatal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complicaciones_perinatales`
--

LOCK TABLES `complicaciones_perinatales` WRITE;
/*!40000 ALTER TABLE `complicaciones_perinatales` DISABLE KEYS */;
/*!40000 ALTER TABLE `complicaciones_perinatales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultas`
--

DROP TABLE IF EXISTS `consultas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultas` (
  `id_consulta` int NOT NULL AUTO_INCREMENT,
  `motivo_consulta` varchar(50) DEFAULT NULL,
  `enfermedad_actual` varchar(50) DEFAULT NULL,
  `fecha_atencion` date DEFAULT NULL,
  `fecha_proxima_consulta` date DEFAULT NULL,
  `id_historia_clinica` int NOT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  `id_paciente` int NOT NULL,
  `hora_consulta` time DEFAULT NULL,
  `peso` double DEFAULT NULL,
  `talla` double DEFAULT NULL,
  `temperatura` double DEFAULT NULL,
  `frecuencia_cardiaca` int DEFAULT NULL,
  `frecuencia_respiratoria` int DEFAULT NULL,
  `saturacion` int DEFAULT NULL,
  `diagnostico_principal` varchar(255) DEFAULT NULL,
  `tipo_diagnostico` varchar(50) DEFAULT NULL,
  `datos_completos_json` longtext,
  `usuario_medico` varchar(100) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `referencia_hospital` tinyint(1) DEFAULT '0',
  `motivo_referencia` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id_consulta`),
  KEY `fk_consultas_paciente_new` (`id_paciente`),
  CONSTRAINT `fk_consultas_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`),
  CONSTRAINT `fk_consultas_paciente_new` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultas`
--

LOCK TABLES `consultas` WRITE;
/*!40000 ALTER TABLE `consultas` DISABLE KEYS */;
INSERT INTO `consultas` VALUES (1,'asdasd','asdas','2026-01-26',NULL,1,NULL,NULL,NULL,'PENDING',NULL,NULL,2,'14:06:00',12,21,21,21,21,21,'qsdasd','Presuntivo','{\"id\":\"1a959a9d-80a0-4a39-8b31-72013b59fde2\",\"fecha\":\"2026-01-26\",\"hora\":\"14:06:43\",\"estado\":\"Finalizada\",\"motivo\":\"asdasd\",\"enfermedadActual\":\"asdas\",\"antecedentes\":{\"perinatales\":{\"productoGestacion\":\"Única\",\"edadGestacional\":212,\"viaParto\":\"Vaginal\",\"pesoNacimiento\":212,\"tallaNacimiento\":123,\"apgarDetallado\":{\"apariencia\":2,\"pulso\":2,\"reflejos\":1,\"tonoMuscular\":1,\"respiracion\":2},\"apgarTotal\":8,\"complicacionesData\":{\"checks\":{\"sdr\":false,\"ictericia\":false,\"sepsis\":false},\"extras\":[],\"descripcion\":\"sin complicaciones\"},\"complicaciones\":\"sin complicaciones\"},\"vacunacion\":\"Completo\",\"cronicasData\":{\"checks\":{\"Asma\":false,\"Diabetes\":false,\"Cardiopatías\":false,\"Epilepsia\":false},\"extras\":[],\"descripcion\":\"\"},\"cronicas\":{\"Asma\":false,\"Diabetes\":false,\"Cardiopatías\":false,\"Epilepsia\":false},\"listaAlergias\":[],\"alergiasDetalle\":\"\",\"listaHospitalizaciones\":[],\"listaCirugias\":[],\"familiaresData\":{\"checks\":{\"HTA\":false,\"Diabetes\":false,\"Cáncer\":false,\"Enfermedades Genéticas\":false},\"extras\":[],\"descripcion\":\"sin antecedentes\"},\"familiares\":{\"HTA\":false,\"Diabetes\":false,\"Cáncer\":false,\"Enfermedades Genéticas\":false},\"desarrollo\":{\"desconoce\":false,\"hitos\":{\"sostenCefalico\":\"12\",\"sedestacion\":\"23\",\"deambulacion\":\"12\",\"lenguaje\":\"2\"},\"alimentacionDetallada\":{\"lactancia\":{\"checked\":true,\"duracion\":\"23\"},\"formula\":{\"checked\":false,\"tipo\":\"\"},\"ablactacion\":{\"checked\":false,\"edadInicio\":\"\"}},\"alimentacion\":\"Ver detalle\"}},\"examenFisico\":{\"vitales\":{\"peso\":\"12\",\"talla\":\"21\",\"perimetroCefalico\":\"21\",\"temperatura\":\"21\",\"fc\":\"21\",\"fr\":\"21\",\"spo2\":\"21\",\"paSistolica\":\"121\",\"paDiastolica\":\"7\"},\"calculos\":{\"imc\":{\"valor\":\"272.11\",\"categoria\":\"Obesidad\",\"color\":\"text-danger fw-bold\"},\"zPesoEdad\":{\"valor\":\"N/A\",\"interpretacion\":\"Paciente Adulto\",\"color\":\"text-secondary\"},\"zTallaEdad\":{\"valor\":\"N/A\",\"interpretacion\":\"Paciente Adulto\",\"color\":\"text-secondary\"},\"zIMCEdad\":{\"valor\":\"N/A\",\"interpretacion\":\"Paciente Adulto\",\"color\":\"text-secondary\"}},\"segmentario\":{\"aspectoGeneralTexto\":\"\",\"aspectoGeneralChecks\":{\"consciente\":true,\"alerta\":false,\"activo\":false,\"decaido\":false,\"otros\":false},\"aspectoGeneralOtros\":\"\",\"pielChecks\":{\"ictericia\":true,\"cianosis\":false,\"rash\":false,\"otros\":false},\"pielOtros\":\"\",\"cabezaChecks\":{\"fontanela\":false,\"adenopatias\":false,\"otros\":false},\"cabezaOtros\":\"\",\"cardioChecks\":{\"ruidos\":true,\"murmullos\":false,\"soplos\":false,\"crepitantes\":false},\"abdomenChecks\":{\"blando\":true,\"depresible\":false,\"dolor\":false,\"hepatomegalia\":false,\"esplenomegalia\":false},\"neuroChecks\":{\"reflejos\":true,\"estadoMental\":false,\"tono\":false},\"aspectoGeneral\":\" | consciente | \"},\"evolucion\":\"mskdasjdanjsndse\"},\"diagnostico\":{\"principal\":{\"id\":\"db72312b-673b-4af7-a90f-01e83a15c1fc\",\"cie10\":\"qweqw\",\"descripcion\":\"qsdasd\",\"tipo\":\"Presuntivo\"},\"secundarios\":[],\"cie10\":[{\"id\":\"db72312b-673b-4af7-a90f-01e83a15c1fc\",\"cie10\":\"qweqw\",\"descripcion\":\"qsdasd\",\"tipo\":\"Presuntivo\"}],\"impresion\":\"sd\",\"estudios\":\"sdas\",\"resultadosRelevantes\":\"sdas\",\"farmacologicoChecks\":{\"venosa\":false,\"oral\":false,\"oxigeno\":false,\"nebulizacion\":false,\"intramuscular\":false,\"topico\":true,\"otros\":false},\"farmacologicoOtros\":\"\",\"noFarmacologicoChecks\":{\"hidratacion\":true,\"dieta\":false,\"fisioterapia\":false,\"reposo\":false,\"controlTermico\":false,\"educacion\":false,\"otros\":false},\"noFarmacologicoOtros\":\"\",\"plan\":\"qwasd \\n Farma: topico  \\n No Farma: hidratacion \",\"pronostico\":\"Bueno\",\"proximaCita\":\"2026-01-27\"}}','Dr. Jfuu','2026-01-26 19:06:45',0,NULL);
/*!40000 ALTER TABLE `consultas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `datos_gestacionales`
--

DROP TABLE IF EXISTS `datos_gestacionales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `datos_gestacionales` (
  `id_dato_gestacional` int NOT NULL AUTO_INCREMENT,
  `producto_gestacion` varchar(100) DEFAULT NULL,
  `edad_gestacional` varchar(100) DEFAULT NULL,
  `via_parto` varchar(150) DEFAULT NULL,
  `peso_nacer` decimal(5,2) DEFAULT NULL,
  `talla_nacer` decimal(5,2) DEFAULT NULL,
  `apgar_minuto` int DEFAULT NULL,
  `apgar_cinco_minutos` int DEFAULT NULL,
  `complicaciones_perinatales` text,
  `id_antecedente_perinatal` int DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_dato_gestacional`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `datos_gestacionales`
--

LOCK TABLES `datos_gestacionales` WRITE;
/*!40000 ALTER TABLE `datos_gestacionales` DISABLE KEYS */;
/*!40000 ALTER TABLE `datos_gestacionales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `desarrollos_psicomotores`
--

DROP TABLE IF EXISTS `desarrollos_psicomotores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `desarrollos_psicomotores` (
  `id_desarrollo_psicomotor` int NOT NULL AUTO_INCREMENT,
  `observacion` varchar(100) DEFAULT NULL,
  `id_historia_clinica` int NOT NULL,
  `fecha_evaluacion` date DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_desarrollo_psicomotor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `desarrollos_psicomotores`
--

LOCK TABLES `desarrollos_psicomotores` WRITE;
/*!40000 ALTER TABLE `desarrollos_psicomotores` DISABLE KEYS */;
/*!40000 ALTER TABLE `desarrollos_psicomotores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diagnosticos_pacientes`
--

DROP TABLE IF EXISTS `diagnosticos_pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagnosticos_pacientes` (
  `id_diagnostico_paciente` int NOT NULL AUTO_INCREMENT,
  `diagnostico_principal` varchar(50) DEFAULT NULL,
  `diagnostico_secundario` varchar(50) DEFAULT NULL,
  `impresion_diagnostica` varchar(50) DEFAULT NULL,
  `id_diagnostico_plan_manejo` int NOT NULL,
  `id_historia_clinica` int NOT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_diagnostico_paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnosticos_pacientes`
--

LOCK TABLES `diagnosticos_pacientes` WRITE;
/*!40000 ALTER TABLE `diagnosticos_pacientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `diagnosticos_pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diagnosticos_planes_manejos`
--

DROP TABLE IF EXISTS `diagnosticos_planes_manejos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagnosticos_planes_manejos` (
  `id_diagnostico_plan_manejo` int NOT NULL AUTO_INCREMENT,
  `observacion` text,
  `fecha` date DEFAULT NULL,
  `id_historia_clinica` int NOT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_diagnostico_plan_manejo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnosticos_planes_manejos`
--

LOCK TABLES `diagnosticos_planes_manejos` WRITE;
/*!40000 ALTER TABLE `diagnosticos_planes_manejos` DISABLE KEYS */;
/*!40000 ALTER TABLE `diagnosticos_planes_manejos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enfermedades`
--

DROP TABLE IF EXISTS `enfermedades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enfermedades` (
  `id_enfermedad` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) DEFAULT NULL,
  `nombre` varchar(200) NOT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_enfermedad`)
) ENGINE=InnoDB AUTO_INCREMENT=182 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enfermedades`
--

LOCK TABLES `enfermedades` WRITE;
/*!40000 ALTER TABLE `enfermedades` DISABLE KEYS */;
INSERT INTO `enfermedades` VALUES (1,'B26.3','PANCREATITIS POR PAROTIDITIS (K87.1)',NULL,NULL,NULL,'PENDING',NULL,NULL),(2,'B26.8','PAROTIDITIS INFECCIOSA CON OTRAS COMPLICACIONES',NULL,NULL,NULL,'PENDING',NULL,NULL),(3,'B27','MONONUCLEOSIS INFECCIOSA',NULL,NULL,NULL,'PENDING',NULL,NULL),(4,'B27.0','MONONUCLEOSIS DEBIDA A HERPES VIRUS GAMMA',NULL,NULL,NULL,'PENDING',NULL,NULL),(5,'B27.1','MONONUCLEOSIS POR CITOMEGALOVIRUS',NULL,NULL,NULL,'PENDING',NULL,NULL),(6,'B27.8','OTRAS MONONUCLEOSIS INFECCIOSAS',NULL,NULL,NULL,'PENDING',NULL,NULL),(7,'B27.9','MONONUCLEOSIS INFECCIOSA, NO ESPECIFICADA',NULL,NULL,NULL,'PENDING',NULL,NULL),(8,'B30','CONJUNTIVITIS VIRAL',NULL,NULL,NULL,'PENDING',NULL,NULL),(9,'B30.0','QUERATOCONJUNTIVITIS DEBIDA A ADENOVIRUS (H19.2)',NULL,NULL,NULL,'PENDING',NULL,NULL),(10,'B30.1','CONJUNTIVITIS DEBIDA A ADENOVIRUS (H13.1)',NULL,NULL,NULL,'PENDING',NULL,NULL),(11,'B30.2','FARINGOCONJUNTIVITIS VIRAL',NULL,NULL,NULL,'PENDING',NULL,NULL),(12,'B30.3','CONJUNTIVITIS EPIDEMICA AGUDA HEMORRAGICA (ENTEROVIRICA) (H13.1)',NULL,NULL,NULL,'PENDING',NULL,NULL),(13,'B30.8','OTRAS CONJUNTIVITIS VIRALES (H13.1)',NULL,NULL,NULL,'PENDING',NULL,NULL),(14,'B33','OTRAS ENFERMEDADES VIRALES, NO CLASIFICADAS EN OTRA PARTE',NULL,NULL,NULL,'PENDING',NULL,NULL),(15,'B33.0','MIALGIA EPIDEMICA',NULL,NULL,NULL,'PENDING',NULL,NULL),(16,'B33.1','ENFERMEDAD DEL RIO ROSS',NULL,NULL,NULL,'PENDING',NULL,NULL),(17,'B33.2','CARDITIS VIRAL',NULL,NULL,NULL,'PENDING',NULL,NULL),(18,'B33.3','INFECCIONES DEBIDAS A RETROVIRUS, NO CLASIFICADAS EN OTRA PARTE',NULL,NULL,NULL,'PENDING',NULL,NULL),(19,'B33.8','OTRAS ENFERMEDADES VIRALES ESPECIFICADAS',NULL,NULL,NULL,'PENDING',NULL,NULL),(20,'B34','INFECCION VIRAL DE SITIO NO ESPECIFICADO',NULL,NULL,NULL,'PENDING',NULL,NULL),(21,'B34.0','INFECCION DEBIDA A ADENOVIRUS, SIN OTRA ESPECIFICACION',NULL,NULL,NULL,'PENDING',NULL,NULL),(22,'B34.1','INFECCION DEBIDA A ENTEROVIRUS, SIN OTRA ESPECIFICACION',NULL,NULL,NULL,'PENDING',NULL,NULL),(23,'B34.2','INFECCION DEBIDA A CORONAVIRUS, SIN OTRA ESPECIFICACION',NULL,NULL,NULL,'PENDING',NULL,NULL),(24,'B34.3','INFECCION DEBIDA A PARVOVIRUS, SIN OTRA ESPECIFICACION',NULL,NULL,NULL,'PENDING',NULL,NULL),(25,'B34.4','INFECCION DEBIDA A PAPOVAVIRUS, SIN OTRA ESPECIFICACION',NULL,NULL,NULL,'PENDING',NULL,NULL),(26,'B34.8','OTRAS INFECCIONES VIRALES DE SITIO NO ESPECIFICADO',NULL,NULL,NULL,'PENDING',NULL,NULL),(27,'B34.9','INFECCION VIRAL, NO ESPECIFICADA',NULL,NULL,NULL,'PENDING',NULL,NULL),(28,'B35','DERMATOFITOSIS',NULL,NULL,NULL,'PENDING',NULL,NULL),(29,'B35.0','TIÑA DE LA BARBA Y DEL CUERO CABELLUDO',NULL,NULL,NULL,'PENDING',NULL,NULL),(30,'B35.1','TIÑA DE LAS UÑAS',NULL,NULL,NULL,'PENDING',NULL,NULL),(31,'B35.2','TIÑA DE LA MANO',NULL,NULL,NULL,'PENDING',NULL,NULL),(32,'B35.3','TIÑA DEL PIE (TINEA PEDIS)',NULL,NULL,NULL,'PENDING',NULL,NULL),(33,'B35.4','TIÑA DEL CUERPO (TINEA CORPORIS)',NULL,NULL,NULL,'PENDING',NULL,NULL),(34,'B35.5','TIÑA IMBRICADA (TINEA IMBRICATA)',NULL,NULL,NULL,'PENDING',NULL,NULL),(35,'B35.6','TIÑA INGUINAL (TINEA CRURIS)',NULL,NULL,NULL,'PENDING',NULL,NULL),(36,'B35.8','OTRAS DERMATOFITOSIS',NULL,NULL,NULL,'PENDING',NULL,NULL),(37,'B35.9','DERMATOFITOSIS, NO ESPECIFICADA',NULL,NULL,NULL,'PENDING',NULL,NULL),(38,'B36','OTRAS MICOSIS SUPERFICIALES',NULL,NULL,NULL,'PENDING',NULL,NULL),(39,'B36.0','PITIRIASIS VERSICOLOR',NULL,NULL,NULL,'PENDING',NULL,NULL),(40,'B36.1','TIÑA NEGRA',NULL,NULL,NULL,'PENDING',NULL,NULL),(41,'B36.2','PIEDRA BLANCA',NULL,NULL,NULL,'PENDING',NULL,NULL),(42,'B36.3','PIEDRA NEGRA',NULL,NULL,NULL,'PENDING',NULL,NULL),(43,'B36.8','OTRAS MICOSIS SUPERFICIALES ESPECIFICADAS',NULL,NULL,NULL,'PENDING',NULL,NULL),(44,'B36.9','MICOSIS SUPERFICIAL, SIN OTRA ESPECIFICACION',NULL,NULL,NULL,'PENDING',NULL,NULL),(45,'B37','CANDIDIASIS',NULL,NULL,NULL,'PENDING',NULL,NULL),(46,'B37.0','ESTOMATITIS CANDIDIASICA',NULL,NULL,NULL,'PENDING',NULL,NULL),(47,'B37.1','CANDIDIASIS PULMONAR',NULL,NULL,NULL,'PENDING',NULL,NULL),(48,'B37.2','CANDIDIASIS DE LA PIEL Y LAS UÑAS',NULL,NULL,NULL,'PENDING',NULL,NULL),(49,'B37.3','CANDIDASIS DE LA VULVA Y LA VAGINA (N77.1)',NULL,NULL,NULL,'PENDING',NULL,NULL),(50,'B37.4','CANDIDIASIS DE OTRAS LOCALIZACIONES UROGENITALES',NULL,NULL,NULL,'PENDING',NULL,NULL),(51,'B37.5','MENINGITIS DEBIDA A CANDIDA (G02.1)',NULL,NULL,NULL,'PENDING',NULL,NULL),(52,'B37.6','ENDOCARDITIS DEBIDA A CANDIDA (I39.8)',NULL,NULL,NULL,'PENDING',NULL,NULL),(53,'B37.7','SEPTICEMIA DEBIDA A CANDIDA',NULL,NULL,NULL,'PENDING',NULL,NULL),(54,'B37.8','CANDIDIASIS DE OTROS SITIOS',NULL,NULL,NULL,'PENDING',NULL,NULL),(55,'B37.9','CANDIDIASIS, NO ESPECIFICADA',NULL,NULL,NULL,'PENDING',NULL,NULL),(56,'B38','COCCIDIOIDOMICOSIS',NULL,NULL,NULL,'PENDING',NULL,NULL),(57,'B38.0','COCCIDIOIDOMICOSIS PULMONAR AGUDA',NULL,NULL,NULL,'PENDING',NULL,NULL),(58,'B38.1','COCCIDIOIDOMICOSIS PULMONAR CRONICA',NULL,NULL,NULL,'PENDING',NULL,NULL),(59,'B38.2','COCCIDIOIDOMICOSIS PULMONAR, SIN OTRA ESPECIFICACION',NULL,NULL,NULL,'PENDING',NULL,NULL),(60,'B38.3','COCCIDIOIDOMICOSIS CUTANEA',NULL,NULL,NULL,'PENDING',NULL,NULL),(61,'B38.4','MENINGITIS DEBIDA A COCCIDIOIDOMICOSIS (G02.1)',NULL,NULL,NULL,'PENDING',NULL,NULL),(62,'B38.7','COCCIDIOIDOMICOSIS DISEMINADA',NULL,NULL,NULL,'PENDING',NULL,NULL),(63,'B38.8','OTRAS FORMAS DE COCCIDIOIDOMICOSIS',NULL,NULL,NULL,'PENDING',NULL,NULL),(64,'B38.9','COCCIDIOIDOMICOSIS, NO ESPECIFICADA',NULL,NULL,NULL,'PENDING',NULL,NULL),(65,'B39','HISTOPLASMOSIS',NULL,NULL,NULL,'PENDING',NULL,NULL),(66,'B39.0','INFECCION PULMONAR AGUDA DEBIDA A HISTOPLASMA CAPSULATUM',NULL,NULL,NULL,'PENDING',NULL,NULL),(67,'B39.1','INFECCION PULMONAR CRONICA DEBIDA A HISTOPLASMA CAPSULATUM',NULL,NULL,NULL,'PENDING',NULL,NULL),(68,'B39.2','INFECCION PULMONAR DEBIDA A HISTOPLASMA CAPSULATUM, SIN OTRA ESPECIFICACION',NULL,NULL,NULL,'PENDING',NULL,NULL),(69,'B39.3','INFECCION DISEMINADA DEBIDA A HISTOPLASMA CAPSULATUM',NULL,NULL,NULL,'PENDING',NULL,NULL),(70,'B39.4','HISTOPLASMOSIS DEBIDA A HISTOPLASMA CAPSULATUM, SIN OTRA ESPECIFICACION',NULL,NULL,NULL,'PENDING',NULL,NULL),(71,'B39.5','INFECCION DEBIDA A HISTOPLASMA DUBOISII',NULL,NULL,NULL,'PENDING',NULL,NULL),(72,'B39.9','HISTOPLASMOSIS, NO ESPECIFICADA',NULL,NULL,NULL,'PENDING',NULL,NULL),(73,'B40','BLASTOMICOSIS',NULL,NULL,NULL,'PENDING',NULL,NULL),(74,'B40.0','BLASTOMICOSIS PULMONAR AGUDA',NULL,NULL,NULL,'PENDING',NULL,NULL),(75,'B40.1','BLASTOMICOSIS PULMONAR CRONICA',NULL,NULL,NULL,'PENDING',NULL,NULL),(76,'B40.2','BLASTOMICOSIS PULMONAR, SIN OTRA ESPECIFICACION',NULL,NULL,NULL,'PENDING',NULL,NULL),(77,'B40.3','BLASTOMICOSIS CUTANEA',NULL,NULL,NULL,'PENDING',NULL,NULL),(78,'B40.7','BLASTOMICOSIS DISEMINADA',NULL,NULL,NULL,'PENDING',NULL,NULL),(79,'B40.8','OTRAS FORMAS DE BLASTOMICOSIS',NULL,NULL,NULL,'PENDING',NULL,NULL),(80,'B40.9','BLASTOMICOSIS, NO ESPECIFICADA',NULL,NULL,NULL,'PENDING',NULL,NULL),(81,'B41','PARACOCCIDIOIDOMICOSIS',NULL,NULL,NULL,'PENDING',NULL,NULL),(82,'B41.0','PARACOCCIDIOIDOMICOSIS PULMONAR',NULL,NULL,NULL,'PENDING',NULL,NULL),(83,'B41.7','PARACOCCIDIOIDOMICOSIS DISEMINADA',NULL,NULL,NULL,'PENDING',NULL,NULL),(84,'B41.8','OTRAS FORMAS DE PARACOCCIDIOIDOMICOSIS',NULL,NULL,NULL,'PENDING',NULL,NULL),(85,'B41.9','PARACOCCIDIOIDOMICOSIS, NO ESPECIFICADA',NULL,NULL,NULL,'PENDING',NULL,NULL),(86,'B42','ESPOROTRICOSIS',NULL,NULL,NULL,'PENDING',NULL,NULL),(87,'B42.0','ESPOROTRICOSIS PULMONAR (J99.8)',NULL,NULL,NULL,'PENDING',NULL,NULL),(88,'B42.1','ESPOROTRICOSIS LINFOCUTANEA',NULL,NULL,NULL,'PENDING',NULL,NULL),(89,'B42.7','ESPOROTRICOSIS DISEMINADA',NULL,NULL,NULL,'PENDING',NULL,NULL),(90,'B42.8','OTRAS FORMAS DE ESPOROTRICOSIS',NULL,NULL,NULL,'PENDING',NULL,NULL),(91,'B42.9','ESPOROTRICOSIS, NO ESPECIFICADA',NULL,NULL,NULL,'PENDING',NULL,NULL),(92,'B43','CROMOMICOSIS Y ABSCESO FEOMICOTICO',NULL,NULL,NULL,'PENDING',NULL,NULL),(93,'B43.0','CROMOMICOSIS CUTANEA',NULL,NULL,NULL,'PENDING',NULL,NULL),(94,'B43.1','ABSCESO CEREBRAL FEOMICOTICO',NULL,NULL,NULL,'PENDING',NULL,NULL),(95,'B43.2','ABSCESO Y QUISTE SUBCUTANEO FEOMICOTICO',NULL,NULL,NULL,'PENDING',NULL,NULL),(96,'B43.8','OTRAS FORMAS DE CROMOMICOSIS',NULL,NULL,NULL,'PENDING',NULL,NULL),(97,'B43.9','CROMOMICOSIS, NO ESPECIFICADA',NULL,NULL,NULL,'PENDING',NULL,NULL),(98,'B44','ASPERGILOSIS',NULL,NULL,NULL,'PENDING',NULL,NULL),(99,'B44.0','ASPERGILOSIS PULMONAR INVASIVA',NULL,NULL,NULL,'PENDING',NULL,NULL),(100,'B44.1','OTRAS ASPERGILOSIS PULMONARES',NULL,NULL,NULL,'PENDING',NULL,NULL),(101,'A00','Cólera','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(102,'A01','Fiebres tifoidea y paratifoidea','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(103,'A02','Infecciones debidas a otras salmonelas','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(104,'A03','Shigelosis','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(105,'A04','Otras infecciones intestinales bacterianas','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(106,'A05','Intoxicación alimentaria bacteriana','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(107,'A06','Amebiasis','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(108,'A07','Otras enfermedades parasitarias intestinales','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(109,'A08','Otras gastroenteritis y colitis','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(110,'A09','Gastroenteritis y colitis de origen no especificado','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(111,'B00','Infecciones por virus del herpes','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(112,'B01','Varicela','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(113,'B02','Herpes zoster','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(114,'B03','Viruela','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(115,'B04','Mononucleosis infecciosa','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(116,'B05','Sarampión','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(117,'B06','Rubéola','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(118,'B07','Verrugas víricas','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(119,'B08','Otras enfermedades virales','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(120,'B09','Infecciones virales no especificadas','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(121,'E00','Síndrome de deficiencia de yodo','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(122,'E01','Bocio endémico por deficiencia de yodo','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(123,'E02','Hipotiroidismo subclínico por deficiencia de yodo','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(124,'E03','Hipotiroidismo congénito','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(125,'E04','Hipotiroidismo adquirido','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(126,'E05','Hipertiroidismo','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(127,'E10','Diabetes mellitus tipo 1','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(128,'E11','Diabetes mellitus tipo 2','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(129,'E12','Diabetes mellitus mal definida','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(130,'E13','Otras diabetes mellitus','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(131,'I10','Hipertensión esencial (primaria)','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(132,'I11','Enfermedad cardíaca hipertensiva','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(133,'I12','Enfermedad renal hipertensiva','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(134,'I13','Enfermedad cardiorrenal hipertensiva','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(135,'I20','Angina de pecho','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(136,'I21','Infarto agudo del miocardio','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(137,'I22','Infarto subsecuente del miocardio','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(138,'I25','Enfermedad ateroesclerótica del corazón','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(139,'I50','Insuficiencia cardíaca','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(140,'I63','Infarto cerebral','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(141,'J00','Nasofaringitis aguda (resfriado común)','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(142,'J01','Sinusitis aguda','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(143,'J02','Faringitis aguda','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(144,'J03','Amigdalitis aguda','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(145,'J04','Laringitis y traqueítis aguda','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(146,'J05','Crup','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(147,'J06','Infecciones agudas de las vías respiratorias superiores','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(148,'J18','Neumonía','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(149,'J44','Enfermedad pulmonar obstructiva crónica','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(150,'J45','Asma','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(151,'K29','Gastritis y duodenitis','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(152,'K30','Dispepsia','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(153,'K35','Apendicitis aguda','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(154,'K50','Enfermedad de Crohn','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(155,'K51','Colitis ulcerosa','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(156,'K70','Enfermedad hepática alcohólica','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(157,'K80','Litiasis de la vesícula biliar','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(158,'K85','Pancreatitis aguda','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(159,'N00','Síndrome nefrítico agudo','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(160,'N10','Nefritis tubulointersticial aguda','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(161,'N30','Cistitis','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(162,'N39','Otros trastornos del sistema urinario','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(163,'N40','Hiperplasia prostática','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(164,'R05','Tos','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(165,'R10','Dolor abdominal y pelvis','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(166,'R50','Fiebre de origen desconocido','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(167,'R51','Cefalea','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(168,'R10.0','Abdomen agudo','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(169,'R10.1','Dolor epigástrico','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(170,'R10.2','Dolor torácico','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(171,'S00','Traumatismo de la cabeza','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(172,'S01','Traumatismo de la cara y cráneo','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(173,'S06','Traumatismo intracraneal','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(174,'S70','Contusión de la cadera y del muslo','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(175,'S80','Contusión de la pierna','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(176,'S90','Contusión del pie y del tobillo','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(177,'O00','Embarazo ectópico','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(178,'O03','Aborto espontáneo','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(179,'O09','Embarazo de alto riesgo','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(180,'O24','Diabetes mellitus gestacional','ACTIVO',NULL,NULL,'PENDING',NULL,NULL),(181,'O32','Atención prenatal por sospecha de fetales anormales','ACTIVO',NULL,NULL,'PENDING',NULL,NULL);
/*!40000 ALTER TABLE `enfermedades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enfermedades_diagnosticadas`
--

DROP TABLE IF EXISTS `enfermedades_diagnosticadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enfermedades_diagnosticadas` (
  `id_enfermedad_diagnosticada` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(20) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `id_enfermedad` int DEFAULT NULL,
  `id_antecedente_patologico_personal` int DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_enfermedad_diagnosticada`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enfermedades_diagnosticadas`
--

LOCK TABLES `enfermedades_diagnosticadas` WRITE;
/*!40000 ALTER TABLE `enfermedades_diagnosticadas` DISABLE KEYS */;
/*!40000 ALTER TABLE `enfermedades_diagnosticadas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estudios_laboratorios`
--

DROP TABLE IF EXISTS `estudios_laboratorios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estudios_laboratorios` (
  `id_estudio_laboratorio` int NOT NULL AUTO_INCREMENT,
  `solicitados` varchar(20) DEFAULT NULL,
  `resultados_relevantes` varchar(100) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `id_consulta` int NOT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_estudio_laboratorio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudios_laboratorios`
--

LOCK TABLES `estudios_laboratorios` WRITE;
/*!40000 ALTER TABLE `estudios_laboratorios` DISABLE KEYS */;
/*!40000 ALTER TABLE `estudios_laboratorios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examenes_fisicos`
--

DROP TABLE IF EXISTS `examenes_fisicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examenes_fisicos` (
  `id_examen_fisico` int NOT NULL AUTO_INCREMENT,
  `id_consulta` int DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_examen_fisico`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examenes_fisicos`
--

LOCK TABLES `examenes_fisicos` WRITE;
/*!40000 ALTER TABLE `examenes_fisicos` DISABLE KEYS */;
/*!40000 ALTER TABLE `examenes_fisicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examenes_fisicos_segmentarios`
--

DROP TABLE IF EXISTS `examenes_fisicos_segmentarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examenes_fisicos_segmentarios` (
  `id_examen_fisico_segmentario` int NOT NULL AUTO_INCREMENT,
  `id_examen_fisico` int DEFAULT NULL,
  `id_aspectos_general` int DEFAULT NULL,
  `observaciones` varchar(200) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_examen_fisico_segmentario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examenes_fisicos_segmentarios`
--

LOCK TABLES `examenes_fisicos_segmentarios` WRITE;
/*!40000 ALTER TABLE `examenes_fisicos_segmentarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `examenes_fisicos_segmentarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupos_etnicos`
--

DROP TABLE IF EXISTS `grupos_etnicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupos_etnicos` (
  `id_grupo_etnico` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(150) NOT NULL,
  `fecha` date DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_grupo_etnico`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupos_etnicos`
--

LOCK TABLES `grupos_etnicos` WRITE;
/*!40000 ALTER TABLE `grupos_etnicos` DISABLE KEYS */;
/*!40000 ALTER TABLE `grupos_etnicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historias_clinicas`
--

DROP TABLE IF EXISTS `historias_clinicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historias_clinicas` (
  `id_historia_clinica` int NOT NULL AUTO_INCREMENT,
  `id_paciente` int NOT NULL,
  `fecha_creacion` date DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_historia_clinica`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historias_clinicas`
--

LOCK TABLES `historias_clinicas` WRITE;
/*!40000 ALTER TABLE `historias_clinicas` DISABLE KEYS */;
INSERT INTO `historias_clinicas` VALUES (1,2,'2026-01-26','Dr. Jfuu',NULL,'fc17be17-2e0b-41b8-8bc2-01a60e0ed84b',NULL,'2026-01-27 00:06:45',NULL);
/*!40000 ALTER TABLE `historias_clinicas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hitos_desarrollo`
--

DROP TABLE IF EXISTS `hitos_desarrollo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hitos_desarrollo` (
  `id_hito_desarrollo` int NOT NULL AUTO_INCREMENT,
  `sosten_cefalio` varchar(150) DEFAULT NULL,
  `sedestacion` varchar(150) DEFAULT NULL,
  `deambulacion` varchar(150) DEFAULT NULL,
  `lenguaje` varchar(150) DEFAULT NULL,
  `observacion` varchar(100) DEFAULT NULL,
  `id_desarrollo_psicomotor` int NOT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_hito_desarrollo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hitos_desarrollo`
--

LOCK TABLES `hitos_desarrollo` WRITE;
/*!40000 ALTER TABLE `hitos_desarrollo` DISABLE KEYS */;
/*!40000 ALTER TABLE `hitos_desarrollo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hospitalizaciones_previas`
--

DROP TABLE IF EXISTS `hospitalizaciones_previas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hospitalizaciones_previas` (
  `id_hospitalizacion_previa` int NOT NULL AUTO_INCREMENT,
  `causa` varchar(20) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `id_antecedente_patologico_personal` int NOT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  `id_paciente` int DEFAULT NULL,
  PRIMARY KEY (`id_hospitalizacion_previa`),
  KEY `fk_hospitalizaciones_paciente` (`id_paciente`),
  CONSTRAINT `fk_hospitalizaciones_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hospitalizaciones_previas`
--

LOCK TABLES `hospitalizaciones_previas` WRITE;
/*!40000 ALTER TABLE `hospitalizaciones_previas` DISABLE KEYS */;
/*!40000 ALTER TABLE `hospitalizaciones_previas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `neurologicos`
--

DROP TABLE IF EXISTS `neurologicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `neurologicos` (
  `id_neurologico` int NOT NULL AUTO_INCREMENT,
  `id_examen_fisico_segmentario` int NOT NULL,
  `reflejo_osteotendinoso` varchar(100) DEFAULT NULL,
  `estado_mental` varchar(100) DEFAULT NULL,
  `tono_muscular` varchar(100) DEFAULT NULL,
  `otros` varchar(150) DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  PRIMARY KEY (`id_neurologico`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `neurologicos`
--

LOCK TABLES `neurologicos` WRITE;
/*!40000 ALTER TABLE `neurologicos` DISABLE KEYS */;
/*!40000 ALTER TABLE `neurologicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacientes` (
  `id_paciente` int NOT NULL AUTO_INCREMENT,
  `cedula` varchar(15) NOT NULL,
  `tipo_identificacion` varchar(20) DEFAULT 'CEDULA',
  `id_psicomotor` int DEFAULT NULL,
  `id_antecedente_familiar` int DEFAULT NULL,
  `id_examen_fisico` int DEFAULT NULL,
  `id_diagnostico_plan_manejo` int DEFAULT NULL,
  `id_grupo_etnico` int DEFAULT NULL,
  `id_parroquia` int DEFAULT NULL,
  `id_prq_canton` int DEFAULT NULL,
  `id_prq_cnt_provincia` int DEFAULT NULL,
  `fecha_creacion` date DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` varchar(20) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  `primer_nombre` varchar(60) NOT NULL DEFAULT '',
  `segundo_nombre` varchar(60) DEFAULT NULL,
  `apellido_paterno` varchar(60) NOT NULL DEFAULT '',
  `apellido_materno` varchar(60) DEFAULT NULL,
  `tipo_sangre` varchar(10) DEFAULT NULL,
  `anio_escolar` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_paciente`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes`
--

LOCK TABLES `pacientes` WRITE;
/*!40000 ALTER TABLE `pacientes` DISABLE KEYS */;
INSERT INTO `pacientes` VALUES (1,'','CEDULA',NULL,NULL,NULL,NULL,NULL,NULL,15,NULL,'2026-01-26','2002-01-30','Masculino',NULL,NULL,'b4060945-4d4f-4b53-af03-a8da3f8651e6','PENDING','2026-01-26 12:16:20','WEB','angel','mora','mora','nupia','O-',NULL),(2,'1206431668','CEDULA',NULL,NULL,NULL,NULL,NULL,88,15,NULL,'2026-01-26','2002-01-30','Masculino',NULL,NULL,'c7119b27-c1b0-401c-b780-9ad5a0c1ee87','PENDING','2026-01-26 12:31:26','WEB','angel','rodolfo','mora','nupia','O-',NULL),(3,'1206431668','CEDULA',NULL,NULL,NULL,NULL,NULL,88,15,1,'2026-01-26','2002-01-30','Masculino',NULL,NULL,'42d37ec3-e40b-4d93-9460-d3f8ddf624a4','PENDING','2026-01-26 12:35:40','WEB','angel','rodolfo','mora','nupia','O-',NULL),(4,'1206431668','CEDULA',NULL,NULL,NULL,NULL,NULL,98,15,1,'2026-01-26','2002-01-30','Masculino',NULL,NULL,'3b447e56-8e23-4068-a542-1d580e9712e5','PENDING','2026-01-26 12:36:53','WEB','angel','rodolfo','mora','nupia','O+',NULL),(5,'1206431668','CEDULA',NULL,NULL,NULL,NULL,NULL,95,15,NULL,'2026-01-26','2002-01-30','Masculino',NULL,NULL,'785a7433-e5fa-4a05-b6c4-8806ed786cf8','PENDING','2026-01-26 13:32:26','WEB','angel','rodolfo','mora','nupia','O+',NULL),(6,'1206431668','CEDULA',NULL,NULL,NULL,NULL,NULL,95,15,1,'2026-01-26','2002-01-30','Masculino',NULL,NULL,'f7a22adb-8aa8-46a1-a819-adfb01dd43ce','PENDING','2026-01-26 13:34:43','WEB','angel','rodolfo','mora','nupia','O+',NULL),(9,'1206431668','CEDULA',NULL,NULL,NULL,NULL,NULL,88,15,1,'2026-01-26','2002-01-30','Masculino',NULL,NULL,'29486b86-0797-4790-904b-cfedd88848be','PENDING','2026-01-26 14:29:20','WEB','angela','rodolfa','mora','nupia','O-',NULL),(10,'1206431668','CEDULA',NULL,NULL,NULL,NULL,NULL,88,15,1,'2026-01-26','2002-01-30','Masculino',NULL,NULL,'09d63e23-5af2-44fe-9db8-19bf6f164baa','PENDING','2026-01-26 14:40:36','WEB','ssss','rodolfa','ccc','nupia','O-',NULL),(11,'1206431668','CEDULA',NULL,NULL,NULL,NULL,NULL,88,15,1,'2026-01-26','2002-01-30','Masculino',NULL,NULL,'61bd0a12-ce69-4106-9b96-789dbe8f7605','PENDING','2026-01-26 14:41:39','WEB','cccc','rodolfa','cccc','nupia','O-',NULL),(12,'1206431668','CEDULA',NULL,NULL,NULL,NULL,NULL,88,15,1,'2026-01-26','2002-01-30','Masculino',NULL,NULL,'aaba7472-ec8b-4a99-8c2f-c26822814a56','PENDING','2026-01-26 14:42:24','WEB','sssss','rodolfa','ssss','nupia','O-',NULL),(13,'0106775646','CEDULA',NULL,NULL,NULL,NULL,NULL,676,111,11,'2026-05-19','2026-03-25','Masculino',NULL,NULL,'2c53ba00-3115-4421-a372-f2a9c33b6b50','PENDING','2026-05-19 19:40:02','WEB','Jonnathan','','Guaman','','O+','6to Básica');
/*!40000 ALTER TABLE `pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacientes_tutores`
--

DROP TABLE IF EXISTS `pacientes_tutores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacientes_tutores` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `id_paciente` int NOT NULL,
  `id_tutor` int NOT NULL,
  `parentesco` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes_tutores`
--

LOCK TABLES `pacientes_tutores` WRITE;
/*!40000 ALTER TABLE `pacientes_tutores` DISABLE KEYS */;
INSERT INTO `pacientes_tutores` VALUES (1,9,3,'Padre'),(2,10,4,'Padre'),(3,11,5,'Padre'),(4,12,6,'Padre'),(5,13,7,'Padre');
/*!40000 ALTER TABLE `pacientes_tutores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parroquias`
--

DROP TABLE IF EXISTS `parroquias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parroquias` (
  `id_parroquia` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `id_canton` int NOT NULL,
  `id_cnt_provincia` int NOT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_parroquia`)
) ENGINE=InnoDB AUTO_INCREMENT=2201 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parroquias`
--

LOCK TABLES `parroquias` WRITE;
/*!40000 ALTER TABLE `parroquias` DISABLE KEYS */;
INSERT INTO `parroquias` VALUES (1,'Angel Polibio Chaves',1,2,NULL,'PENDING',NULL,NULL),(2,'Dr. Camilo Ponce',1,12,NULL,'PENDING',NULL,NULL),(3,'Cotocollao',1,17,NULL,'PENDING',NULL,NULL),(4,'El Salto',1,12,NULL,'PENDING',NULL,NULL),(5,'La Dolorosa Del Priorato',1,10,NULL,'PENDING',NULL,NULL),(6,'Licán',1,6,NULL,'PENDING',NULL,NULL),(7,'González Suárez',1,17,NULL,'PENDING',NULL,NULL),(8,'18 De Octubre',1,13,NULL,'PENDING',NULL,NULL),(9,'Roca',1,9,NULL,'PENDING',NULL,NULL),(10,'Rocafuerte',1,9,NULL,'PENDING',NULL,NULL),(12,'La Vicentina',1,17,NULL,'PENDING',NULL,NULL),(13,'San Blas',1,17,NULL,'PENDING',NULL,NULL),(16,'San Sebastián',1,17,NULL,'PENDING',NULL,NULL),(17,'Santa Bárbara',1,17,NULL,'PENDING',NULL,NULL),(18,'Santa Prisca',1,17,NULL,'PENDING',NULL,NULL),(19,'Villa Flora',1,17,NULL,'PENDING',NULL,NULL),(20,'Carcelén',1,17,NULL,'PENDING',NULL,NULL),(21,'Chimbacalle',1,17,NULL,'PENDING',NULL,NULL),(22,'El Batán',1,17,NULL,'PENDING',NULL,NULL),(23,'El Beaterio',1,17,NULL,'PENDING',NULL,NULL),(24,'El Inca',1,17,NULL,'PENDING',NULL,NULL),(25,'Eloy Alfaro',1,17,NULL,'PENDING',NULL,NULL),(26,'Guamaní',1,17,NULL,'PENDING',NULL,NULL),(27,'La Concepción',1,17,NULL,'PENDING',NULL,NULL),(28,'Las Cuadras',1,17,NULL,'PENDING',NULL,NULL),(29,'San Isidro Del Inca',1,17,NULL,'PENDING',NULL,NULL),(30,'Sanjuan',1,17,NULL,'PENDING',NULL,NULL),(31,'Solanda',1,17,NULL,'PENDING',NULL,NULL),(32,'Turubamba',1,17,NULL,'PENDING',NULL,NULL),(50,'Esmeraldas, cabecera cantonal y capital',1,8,NULL,'PENDING',NULL,NULL),(51,'Ayapamba',3,7,NULL,'PENDING',NULL,NULL),(52,'San Francisco De Sageo',2,3,NULL,'PENDING',NULL,NULL),(53,'El Limo (Mariana de Jesús)',10,11,NULL,'PENDING',NULL,NULL),(55,'Santiago',5,2,NULL,'PENDING',NULL,NULL),(56,'Licto',1,6,NULL,'PENDING',NULL,NULL),(57,'Pumallacta',2,6,NULL,'PENDING',NULL,NULL),(58,'San Francisco de Onzole',2,8,NULL,'PENDING',NULL,NULL),(59,'Aguas Negras',1,21,NULL,'PENDING',NULL,NULL),(60,'Santa Clara',1,16,NULL,'PENDING',NULL,NULL),(61,'Tanicuchí',1,5,NULL,'PENDING',NULL,NULL),(63,'San Bartolomé de Pinllog',1,18,NULL,'PENDING',NULL,NULL),(66,'El Triunfo',1,16,NULL,'PENDING',NULL,NULL),(67,'Mindo',1,17,NULL,'PENDING',NULL,NULL),(68,'Unamuncho',1,18,NULL,'PENDING',NULL,NULL),(69,'Nanegalito',1,17,NULL,'PENDING',NULL,NULL),(70,'Nayón',1,17,NULL,'PENDING',NULL,NULL),(71,'Nono',1,17,NULL,'PENDING',NULL,NULL),(72,'Pacto',1,17,NULL,'PENDING',NULL,NULL),(73,'Pedro Vicente Maldonado',1,17,NULL,'PENDING',NULL,NULL),(74,'Perucho',1,17,NULL,'PENDING',NULL,NULL),(75,'Pifo',1,17,NULL,'PENDING',NULL,NULL),(76,'Píntag',1,17,NULL,'PENDING',NULL,NULL),(77,'Pomasqui',1,17,NULL,'PENDING',NULL,NULL),(78,'Puéllaro',1,17,NULL,'PENDING',NULL,NULL),(79,'Puembo',1,17,NULL,'PENDING',NULL,NULL),(80,'San Antonio',1,17,NULL,'PENDING',NULL,NULL),(81,'San José de Minas',1,17,NULL,'PENDING',NULL,NULL),(82,'San Miguel de los Bancos',1,17,NULL,'PENDING',NULL,NULL),(83,'Tabacela',1,17,NULL,'PENDING',NULL,NULL),(84,'Tumbaco',1,17,NULL,'PENDING',NULL,NULL),(85,'Yaruquí',1,17,NULL,'PENDING',NULL,NULL),(86,'Zámbiza',1,17,NULL,'PENDING',NULL,NULL),(87,'Puerto Quito',1,17,NULL,'PENDING',NULL,NULL),(88,'Bellavista',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(89,'Cañaribamba',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(90,'El Batán',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(91,'El Sagrario',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(92,'El Vecino',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(93,'Gil Ramírez Dávalos',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(94,'Huayna Cápac',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(95,'Machángara',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(96,'Monay',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(97,'San Blas',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(98,'San Sebastián',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(99,'Sucre',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(100,'Totoracocha',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(101,'Yanuncay',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(102,'Hermano Miguel',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(103,'Baños',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(104,'Cumbe',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(105,'Chaucha',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(106,'Checa (Jidcay)',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(107,'Chiquintad',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(108,'Llacao',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(109,'Molleturo',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(110,'Nulti',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(111,'Octavio Cordero Palacios',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(112,'Paccha',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(113,'Quingeo',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(114,'Ricaurte',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(115,'San Joaquín',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(116,'Santa Ana',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(117,'Sayausí',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(118,'Sidcay',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(119,'Sinincay',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(120,'Tarqui',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(121,'Turi',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(122,'El Valle',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(123,'Victoria del Portete',15,1,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(151,'Sangolquí',163,17,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(152,'Cotogchoa',163,17,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(153,'Rumipamba',163,17,NULL,'PENDING','2026-01-26 07:14:56','SYSTEM'),(154,'CUENCA',15,1,NULL,'PENDING',NULL,NULL),(155,'CHECA',15,1,NULL,'PENDING',NULL,NULL),(156,'VALLE',15,1,NULL,'PENDING',NULL,NULL),(157,'GIRÓN',16,1,NULL,'PENDING',NULL,NULL),(158,'LA ASUNCIÓN',16,1,NULL,'PENDING',NULL,NULL),(159,'SAN GERARDO',16,1,NULL,'PENDING',NULL,NULL),(160,'GUALACEO',17,1,NULL,'PENDING',NULL,NULL),(161,'DANIEL CÓRDOVA TORAL',17,1,NULL,'PENDING',NULL,NULL),(162,'JADÁN',17,1,NULL,'PENDING',NULL,NULL),(163,'MARIANO MORENO',17,1,NULL,'PENDING',NULL,NULL),(164,'REMIGIO CRESPO TORAL',17,1,NULL,'PENDING',NULL,NULL),(165,'SAN JUAN',17,1,NULL,'PENDING',NULL,NULL),(166,'ZHIDMAD',17,1,NULL,'PENDING',NULL,NULL),(167,'LUIS CORDERO VEGA',17,1,NULL,'PENDING',NULL,NULL),(168,'SIMÓN BOLÍVAR',17,1,NULL,'PENDING',NULL,NULL),(169,'NABÓN',18,1,NULL,'PENDING',NULL,NULL),(170,'COCHAPATA',18,1,NULL,'PENDING',NULL,NULL),(171,'EL PROGRESO',18,1,NULL,'PENDING',NULL,NULL),(172,'LAS NIEVES',18,1,NULL,'PENDING',NULL,NULL),(173,'PAUTE',19,1,NULL,'PENDING',NULL,NULL),(174,'BULÁN',19,1,NULL,'PENDING',NULL,NULL),(175,'CHICÁN',19,1,NULL,'PENDING',NULL,NULL),(176,'EL CABO',19,1,NULL,'PENDING',NULL,NULL),(177,'GUARAINAG',19,1,NULL,'PENDING',NULL,NULL),(178,'SAN CRISTÓBAL',19,1,NULL,'PENDING',NULL,NULL),(179,'TOMEBAMBA',19,1,NULL,'PENDING',NULL,NULL),(180,'DUG DUG',19,1,NULL,'PENDING',NULL,NULL),(181,'PUCARÁ',20,1,NULL,'PENDING',NULL,NULL),(182,'SAN RAFAEL DE SHARUG',20,1,NULL,'PENDING',NULL,NULL),(183,'SAN FERNANDO',21,1,NULL,'PENDING',NULL,NULL),(184,'CHUMBLÍN',21,1,NULL,'PENDING',NULL,NULL),(185,'SANTA ISABEL',22,1,NULL,'PENDING',NULL,NULL),(186,'ABDÓN CALDERÓN',22,1,NULL,'PENDING',NULL,NULL),(187,'EL CARMEN DE PIJILÍ',22,1,NULL,'PENDING',NULL,NULL),(188,'SHAGLLI',22,1,NULL,'PENDING',NULL,NULL),(189,'SAN SALVADOR DE CAÑARIBAMBA',22,1,NULL,'PENDING',NULL,NULL),(190,'SÍGSIG',23,1,NULL,'PENDING',NULL,NULL),(191,'CUCHIL',23,1,NULL,'PENDING',NULL,NULL),(192,'JIMA',23,1,NULL,'PENDING',NULL,NULL),(193,'GÜEL',23,1,NULL,'PENDING',NULL,NULL),(194,'LUDO',23,1,NULL,'PENDING',NULL,NULL),(195,'SAN BARTOLOMÉ',23,1,NULL,'PENDING',NULL,NULL),(196,'SAN JOSÉ DE RARANGA',23,1,NULL,'PENDING',NULL,NULL),(197,'SAN FELIPE DE OÑA',201,1,NULL,'PENDING',NULL,NULL),(198,'SUSUDEL',201,1,NULL,'PENDING',NULL,NULL),(199,'CHORDELEG',202,1,NULL,'PENDING',NULL,NULL),(200,'PRINCIPAL',202,1,NULL,'PENDING',NULL,NULL),(201,'LA UNIÓN',202,1,NULL,'PENDING',NULL,NULL),(202,'LUIS GALARZA ORELLANA',202,1,NULL,'PENDING',NULL,NULL),(203,'SAN MARTÍN DE PUZHIO',202,1,NULL,'PENDING',NULL,NULL),(204,'EL PAN',203,1,NULL,'PENDING',NULL,NULL),(205,'SAN VICENTE',203,1,NULL,'PENDING',NULL,NULL),(206,'SEVILLA DE ORO',204,1,NULL,'PENDING',NULL,NULL),(207,'AMALUZA',204,1,NULL,'PENDING',NULL,NULL),(208,'PALMAS',204,1,NULL,'PENDING',NULL,NULL),(209,'GUACHAPALA',205,1,NULL,'PENDING',NULL,NULL),(210,'CAMILO PONCE ENRÍQUEZ',210,1,NULL,'PENDING',NULL,NULL),(211,'GUARANDA',34,2,NULL,'PENDING',NULL,NULL),(212,'FACUNDO VELA',34,2,NULL,'PENDING',NULL,NULL),(213,'JULIO E. MORENO',34,2,NULL,'PENDING',NULL,NULL),(214,'SALINAS',34,2,NULL,'PENDING',NULL,NULL),(215,'SAN LORENZO',34,2,NULL,'PENDING',NULL,NULL),(216,'SAN SIMÓN',34,2,NULL,'PENDING',NULL,NULL),(217,'SANTA FE',34,2,NULL,'PENDING',NULL,NULL),(218,'SIMIÁTUG',34,2,NULL,'PENDING',NULL,NULL),(219,'SAN LUIS DE PAMBIL',34,2,NULL,'PENDING',NULL,NULL),(220,'CHILLANES',35,2,NULL,'PENDING',NULL,NULL),(221,'SAN JOSÉ DEL TAMBO',35,2,NULL,'PENDING',NULL,NULL),(222,'SAN JOSÉ DE CHIMBO',36,2,NULL,'PENDING',NULL,NULL),(223,'ASUNCIÓN',36,2,NULL,'PENDING',NULL,NULL),(224,'LA MAGDALENA',36,2,NULL,'PENDING',NULL,NULL),(225,'SAN SEBASTIÁN',36,2,NULL,'PENDING',NULL,NULL),(226,'TELIMBELA',36,2,NULL,'PENDING',NULL,NULL),(227,'ECHEANDÍA',37,2,NULL,'PENDING',NULL,NULL),(228,'SAN MIGUEL',38,2,NULL,'PENDING',NULL,NULL),(229,'BALSAPAMBA',38,2,NULL,'PENDING',NULL,NULL),(230,'BILOVÁN',38,2,NULL,'PENDING',NULL,NULL),(231,'RÉGULO DE MORA',38,2,NULL,'PENDING',NULL,NULL),(232,'SAN PABLO',38,2,NULL,'PENDING',NULL,NULL),(233,'SANTIAGO',38,2,NULL,'PENDING',NULL,NULL),(234,'SAN VICENTE',38,2,NULL,'PENDING',NULL,NULL),(235,'CALUMA',39,2,NULL,'PENDING',NULL,NULL),(236,'LAS NAVES',40,2,NULL,'PENDING',NULL,NULL),(237,'AZOGUES',24,3,NULL,'PENDING',NULL,NULL),(238,'COJITAMBO',24,3,NULL,'PENDING',NULL,NULL),(239,'GUAPÁN',24,3,NULL,'PENDING',NULL,NULL),(240,'JAVIER LOYOLA',24,3,NULL,'PENDING',NULL,NULL),(241,'LUIS CORDERO',24,3,NULL,'PENDING',NULL,NULL),(242,'PINDILIG',24,3,NULL,'PENDING',NULL,NULL),(243,'RIVERA',24,3,NULL,'PENDING',NULL,NULL),(244,'SAN MIGUEL',24,3,NULL,'PENDING',NULL,NULL),(245,'TADAY',24,3,NULL,'PENDING',NULL,NULL),(246,'BIBLIÁN',25,3,NULL,'PENDING',NULL,NULL),(247,'NAZÓN',25,3,NULL,'PENDING',NULL,NULL),(248,'SAN FRANCISCO DE SAGEO',25,3,NULL,'PENDING',NULL,NULL),(249,'TURUPAMBA',25,3,NULL,'PENDING',NULL,NULL),(250,'JERUSALÉN',25,3,NULL,'PENDING',NULL,NULL),(251,'CAÑAR',26,3,NULL,'PENDING',NULL,NULL),(252,'CHONTAMARCA',26,3,NULL,'PENDING',NULL,NULL),(253,'CHOROCOPTE',26,3,NULL,'PENDING',NULL,NULL),(254,'GENERAL MORALES',26,3,NULL,'PENDING',NULL,NULL),(255,'GUALLETURO',26,3,NULL,'PENDING',NULL,NULL),(256,'HONORATO VÁSQUEZ',26,3,NULL,'PENDING',NULL,NULL),(257,'INGAPIRCA',26,3,NULL,'PENDING',NULL,NULL),(258,'JUNCAL',26,3,NULL,'PENDING',NULL,NULL),(259,'SAN ANTONIO',26,3,NULL,'PENDING',NULL,NULL),(260,'ZHUD',26,3,NULL,'PENDING',NULL,NULL),(261,'VENTURA',26,3,NULL,'PENDING',NULL,NULL),(262,'DUCUR',26,3,NULL,'PENDING',NULL,NULL),(263,'LA TRONCAL',27,3,NULL,'PENDING',NULL,NULL),(264,'MANUEL J. CALLE',27,3,NULL,'PENDING',NULL,NULL),(265,'PANCHO NEGRO',27,3,NULL,'PENDING',NULL,NULL),(266,'EL TAMBO',206,3,NULL,'PENDING',NULL,NULL),(267,'DÉLEG',207,3,NULL,'PENDING',NULL,NULL),(268,'SOLANO',207,3,NULL,'PENDING',NULL,NULL),(269,'SUSCAL',211,3,NULL,'PENDING',NULL,NULL),(270,'TULCÁN',41,4,NULL,'PENDING',NULL,NULL),(271,'EL CARMELO',41,4,NULL,'PENDING',NULL,NULL),(272,'JULIO ANDRADE',41,4,NULL,'PENDING',NULL,NULL),(273,'MALDONADO',41,4,NULL,'PENDING',NULL,NULL),(274,'PIOTER',41,4,NULL,'PENDING',NULL,NULL),(275,'TOBAR DONOSO',41,4,NULL,'PENDING',NULL,NULL),(276,'TUFIÑO',41,4,NULL,'PENDING',NULL,NULL),(277,'URBINA',41,4,NULL,'PENDING',NULL,NULL),(278,'EL CHICAL',41,4,NULL,'PENDING',NULL,NULL),(279,'SANTA MARTHA DE CUBA',41,4,NULL,'PENDING',NULL,NULL),(280,'BOLÍVAR',42,4,NULL,'PENDING',NULL,NULL),(281,'GARCÍA MORENO',42,4,NULL,'PENDING',NULL,NULL),(282,'LOS ANDES',42,4,NULL,'PENDING',NULL,NULL),(283,'MONTE OLIVO',42,4,NULL,'PENDING',NULL,NULL),(284,'SAN VICENTE DE PUSIR',42,4,NULL,'PENDING',NULL,NULL),(285,'SAN RAFAEL',42,4,NULL,'PENDING',NULL,NULL),(286,'EL ÁNGEL',43,4,NULL,'PENDING',NULL,NULL),(287,'EL GOALTAL',43,4,NULL,'PENDING',NULL,NULL),(288,'LA LIBERTAD',43,4,NULL,'PENDING',NULL,NULL),(289,'SAN ISIDRO',43,4,NULL,'PENDING',NULL,NULL),(290,'MIRA',44,4,NULL,'PENDING',NULL,NULL),(291,'CONCEPCIÓN',44,4,NULL,'PENDING',NULL,NULL),(292,'JIJÓN Y CAAMAÑO',44,4,NULL,'PENDING',NULL,NULL),(293,'JUAN MONTALVO',44,4,NULL,'PENDING',NULL,NULL),(294,'SAN GABRIEL',45,4,NULL,'PENDING',NULL,NULL),(295,'CRISTÓBAL COLÓN',45,4,NULL,'PENDING',NULL,NULL),(296,'CHITÁN DE NAVARRETE',45,4,NULL,'PENDING',NULL,NULL),(297,'FERNÁNDEZ SALVADOR',45,4,NULL,'PENDING',NULL,NULL),(298,'LA PAZ',45,4,NULL,'PENDING',NULL,NULL),(299,'PIARTAL',45,4,NULL,'PENDING',NULL,NULL),(300,'HUACA',46,4,NULL,'PENDING',NULL,NULL),(301,'MARISCAL SUCRE',46,4,NULL,'PENDING',NULL,NULL),(302,'LATACUNGA',47,5,NULL,'PENDING',NULL,NULL),(303,'ALÁQUEZ',47,5,NULL,'PENDING',NULL,NULL),(304,'BELISARIO QUEVEDO',47,5,NULL,'PENDING',NULL,NULL),(305,'GUAYTACAMA',47,5,NULL,'PENDING',NULL,NULL),(306,'JOSEGUANGO BAJO',47,5,NULL,'PENDING',NULL,NULL),(307,'MULALÓ',47,5,NULL,'PENDING',NULL,NULL),(308,'ONCE DE NOVIEMBRE',47,5,NULL,'PENDING',NULL,NULL),(309,'POALÓ',47,5,NULL,'PENDING',NULL,NULL),(310,'SAN JUAN DE PASTOCALLE',47,5,NULL,'PENDING',NULL,NULL),(311,'TANICUCHÍ',47,5,NULL,'PENDING',NULL,NULL),(312,'TOACASO',47,5,NULL,'PENDING',NULL,NULL),(313,'LA MANÁ',48,5,NULL,'PENDING',NULL,NULL),(314,'GUASAGANDA',48,5,NULL,'PENDING',NULL,NULL),(315,'PUCAYACU',48,5,NULL,'PENDING',NULL,NULL),(316,'EL CORAZÓN',49,5,NULL,'PENDING',NULL,NULL),(317,'MORASPUNGO',49,5,NULL,'PENDING',NULL,NULL),(318,'PINLLOPATA',49,5,NULL,'PENDING',NULL,NULL),(319,'RAMÓN CAMPAÑA',49,5,NULL,'PENDING',NULL,NULL),(320,'PUJILÍ',50,5,NULL,'PENDING',NULL,NULL),(321,'ANGAMARCA',50,5,NULL,'PENDING',NULL,NULL),(322,'GUANGAJE',50,5,NULL,'PENDING',NULL,NULL),(323,'LA VICTORIA',50,5,NULL,'PENDING',NULL,NULL),(324,'PILALÓ',50,5,NULL,'PENDING',NULL,NULL),(325,'TINGO',50,5,NULL,'PENDING',NULL,NULL),(326,'ZUMBAHUA',50,5,NULL,'PENDING',NULL,NULL),(327,'SAN MIGUEL',51,5,NULL,'PENDING',NULL,NULL),(328,'ANTONIO JOSÉ HOLGUÍN',51,5,NULL,'PENDING',NULL,NULL),(329,'CUSUBAMBA',51,5,NULL,'PENDING',NULL,NULL),(330,'MULALILLO',51,5,NULL,'PENDING',NULL,NULL),(331,'MULLIQUINDIL',51,5,NULL,'PENDING',NULL,NULL),(332,'PANSALEO',51,5,NULL,'PENDING',NULL,NULL),(333,'SAQUISILÍ',52,5,NULL,'PENDING',NULL,NULL),(334,'CANCHAGUA',52,5,NULL,'PENDING',NULL,NULL),(335,'CHANTILÍN',52,5,NULL,'PENDING',NULL,NULL),(336,'COCHAPAMBA',52,5,NULL,'PENDING',NULL,NULL),(337,'SIGCHOS',53,5,NULL,'PENDING',NULL,NULL),(338,'CHUGCHILLÁN',53,5,NULL,'PENDING',NULL,NULL),(339,'ISINLIVI',53,5,NULL,'PENDING',NULL,NULL),(340,'LAS PAMPAS',53,5,NULL,'PENDING',NULL,NULL),(341,'PALO QUEMADO',53,5,NULL,'PENDING',NULL,NULL),(342,'RIOBAMBA',54,6,NULL,'PENDING',NULL,NULL),(343,'CACHA',54,6,NULL,'PENDING',NULL,NULL),(344,'CALPI',54,6,NULL,'PENDING',NULL,NULL),(345,'CUBIJÍES',54,6,NULL,'PENDING',NULL,NULL),(346,'FLORES',54,6,NULL,'PENDING',NULL,NULL),(347,'LICÁN',54,6,NULL,'PENDING',NULL,NULL),(348,'LICTO',54,6,NULL,'PENDING',NULL,NULL),(349,'PUNGALÁ',54,6,NULL,'PENDING',NULL,NULL),(350,'PUNÍN',54,6,NULL,'PENDING',NULL,NULL),(351,'QUIMIAG',54,6,NULL,'PENDING',NULL,NULL),(352,'SAN JUAN',54,6,NULL,'PENDING',NULL,NULL),(353,'SAN LUIS',54,6,NULL,'PENDING',NULL,NULL),(354,'ALAUSÍ',55,6,NULL,'PENDING',NULL,NULL),(355,'ACHUPALLAS',55,6,NULL,'PENDING',NULL,NULL),(356,'GUASUNTOS',55,6,NULL,'PENDING',NULL,NULL),(357,'HUIGRA',55,6,NULL,'PENDING',NULL,NULL),(358,'MULTITUD',55,6,NULL,'PENDING',NULL,NULL),(359,'PISTISHI',55,6,NULL,'PENDING',NULL,NULL),(360,'PUMALLACTA',55,6,NULL,'PENDING',NULL,NULL),(361,'SEVILLA',55,6,NULL,'PENDING',NULL,NULL),(362,'SIBAMBE',55,6,NULL,'PENDING',NULL,NULL),(363,'TIXÁN',55,6,NULL,'PENDING',NULL,NULL),(364,'VILLA LA UNIÓN',56,6,NULL,'PENDING',NULL,NULL),(365,'CAÑI',56,6,NULL,'PENDING',NULL,NULL),(366,'COLUMBE',56,6,NULL,'PENDING',NULL,NULL),(367,'JUAN DE VELASCO',56,6,NULL,'PENDING',NULL,NULL),(368,'SANTIAGO DE QUITO',56,6,NULL,'PENDING',NULL,NULL),(369,'CHAMBO',57,6,NULL,'PENDING',NULL,NULL),(370,'CHUNCHI',58,6,NULL,'PENDING',NULL,NULL),(371,'CAPZOL',58,6,NULL,'PENDING',NULL,NULL),(372,'COMPUD',58,6,NULL,'PENDING',NULL,NULL),(373,'GONZOL',58,6,NULL,'PENDING',NULL,NULL),(374,'LLAGOS',58,6,NULL,'PENDING',NULL,NULL),(375,'GUAMOTE',59,6,NULL,'PENDING',NULL,NULL),(376,'CEBADAS',59,6,NULL,'PENDING',NULL,NULL),(377,'PALMIRA',59,6,NULL,'PENDING',NULL,NULL),(378,'GUANO',60,6,NULL,'PENDING',NULL,NULL),(379,'GUANANDO',60,6,NULL,'PENDING',NULL,NULL),(380,'ILAPO',60,6,NULL,'PENDING',NULL,NULL),(381,'LA PROVIDENCIA',60,6,NULL,'PENDING',NULL,NULL),(382,'SAN ANDRÉS',60,6,NULL,'PENDING',NULL,NULL),(383,'SAN GERARDO',60,6,NULL,'PENDING',NULL,NULL),(384,'SAN ISIDRO DE PATULÚ',60,6,NULL,'PENDING',NULL,NULL),(385,'SAN JOSÉ DEL CHAZO',60,6,NULL,'PENDING',NULL,NULL),(386,'SANTA FÉ DE GALÁN',60,6,NULL,'PENDING',NULL,NULL),(387,'VALPARAISO',60,6,NULL,'PENDING',NULL,NULL),(388,'PALLATANGA',61,6,NULL,'PENDING',NULL,NULL),(389,'PENIPE',62,6,NULL,'PENDING',NULL,NULL),(390,'EL ALTAR',62,6,NULL,'PENDING',NULL,NULL),(391,'MATUS',62,6,NULL,'PENDING',NULL,NULL),(392,'PUELA',62,6,NULL,'PENDING',NULL,NULL),(393,'SAN ANTONIO DE BAYUSHIG',62,6,NULL,'PENDING',NULL,NULL),(394,'LA CANDELARIA',62,6,NULL,'PENDING',NULL,NULL),(395,'BILBAO',62,6,NULL,'PENDING',NULL,NULL),(396,'CUMANDÁ',63,6,NULL,'PENDING',NULL,NULL),(397,'MACHALA',10,7,NULL,'PENDING',NULL,NULL),(398,'EL RETIRO',10,7,NULL,'PENDING',NULL,NULL),(399,'ARENILLAS',11,7,NULL,'PENDING',NULL,NULL),(400,'CHACRAS',11,7,NULL,'PENDING',NULL,NULL),(401,'PALMALES',11,7,NULL,'PENDING',NULL,NULL),(402,'CARCABÓN',11,7,NULL,'PENDING',NULL,NULL),(403,'LA CUCA',11,7,NULL,'PENDING',NULL,NULL),(404,'PACCHA',12,7,NULL,'PENDING',NULL,NULL),(405,'AYAPAMBA',12,7,NULL,'PENDING',NULL,NULL),(406,'CORDONCILLO',12,7,NULL,'PENDING',NULL,NULL),(407,'MILAGRO',12,7,NULL,'PENDING',NULL,NULL),(408,'SAN JOSÉ',12,7,NULL,'PENDING',NULL,NULL),(409,'SAN JUAN DE CERRO AZUL',12,7,NULL,'PENDING',NULL,NULL),(410,'BALSAS',13,7,NULL,'PENDING',NULL,NULL),(411,'BELLAMARÍA',13,7,NULL,'PENDING',NULL,NULL),(412,'CHILLA',14,7,NULL,'PENDING',NULL,NULL),(413,'EL GUABO',192,7,NULL,'PENDING',NULL,NULL),(414,'BARBONES',192,7,NULL,'PENDING',NULL,NULL),(415,'LA IBERIA',192,7,NULL,'PENDING',NULL,NULL),(416,'TENDALES',192,7,NULL,'PENDING',NULL,NULL),(417,'RÍO BONITO',192,7,NULL,'PENDING',NULL,NULL),(418,'HUAQUILLAS',193,7,NULL,'PENDING',NULL,NULL),(419,'MARCABELÍ',194,7,NULL,'PENDING',NULL,NULL),(420,'EL INGENIO',194,7,NULL,'PENDING',NULL,NULL),(421,'PASAJE',195,7,NULL,'PENDING',NULL,NULL),(422,'BUENAVISTA',195,7,NULL,'PENDING',NULL,NULL),(423,'CASACAY',195,7,NULL,'PENDING',NULL,NULL),(424,'LA PEAÑA',195,7,NULL,'PENDING',NULL,NULL),(425,'PROGRESO',195,7,NULL,'PENDING',NULL,NULL),(426,'UZHCURRUMI',195,7,NULL,'PENDING',NULL,NULL),(427,'CAÑAQUEMADA',195,7,NULL,'PENDING',NULL,NULL),(428,'PIÑAS',196,7,NULL,'PENDING',NULL,NULL),(429,'CAPIRO',196,7,NULL,'PENDING',NULL,NULL),(430,'LA BOCANA',196,7,NULL,'PENDING',NULL,NULL),(431,'MOROMORO',196,7,NULL,'PENDING',NULL,NULL),(432,'PIEDRAS',196,7,NULL,'PENDING',NULL,NULL),(433,'SAN ROQUE',196,7,NULL,'PENDING',NULL,NULL),(434,'SARACAY',196,7,NULL,'PENDING',NULL,NULL),(435,'PORTOVELO',197,7,NULL,'PENDING',NULL,NULL),(436,'CURTINCAPA',197,7,NULL,'PENDING',NULL,NULL),(437,'MORALES',197,7,NULL,'PENDING',NULL,NULL),(438,'SALATÍ',197,7,NULL,'PENDING',NULL,NULL),(439,'SANTA ROSA',198,7,NULL,'PENDING',NULL,NULL),(440,'BELLAVISTA',198,7,NULL,'PENDING',NULL,NULL),(441,'JAMBELÍ',198,7,NULL,'PENDING',NULL,NULL),(442,'LA AVANZADA',198,7,NULL,'PENDING',NULL,NULL),(443,'SAN ANTONIO',198,7,NULL,'PENDING',NULL,NULL),(444,'TORATA',198,7,NULL,'PENDING',NULL,NULL),(445,'VICTORIA',198,7,NULL,'PENDING',NULL,NULL),(446,'BELLAMARÍA',198,7,NULL,'PENDING',NULL,NULL),(447,'ZARUMA',199,7,NULL,'PENDING',NULL,NULL),(448,'ABAÑÍN',199,7,NULL,'PENDING',NULL,NULL),(449,'ARCAPAMBA',199,7,NULL,'PENDING',NULL,NULL),(450,'GUANAZÁN',199,7,NULL,'PENDING',NULL,NULL),(451,'GUIZHAGUIÑA',199,7,NULL,'PENDING',NULL,NULL),(452,'HUERTAS',199,7,NULL,'PENDING',NULL,NULL),(453,'MALVAS',199,7,NULL,'PENDING',NULL,NULL),(454,'MULUNCAY GRANDE',199,7,NULL,'PENDING',NULL,NULL),(455,'SINSAO',199,7,NULL,'PENDING',NULL,NULL),(456,'SALVIAS',199,7,NULL,'PENDING',NULL,NULL),(457,'LA VICTORIA',200,7,NULL,'PENDING',NULL,NULL),(458,'LA LIBERTAD',200,7,NULL,'PENDING',NULL,NULL),(459,'EL PARAÍSO',200,7,NULL,'PENDING',NULL,NULL),(460,'SAN ISIDRO',200,7,NULL,'PENDING',NULL,NULL),(461,'ESMERALDAS',64,8,NULL,'PENDING',NULL,NULL),(462,'CAMARONES',64,8,NULL,'PENDING',NULL,NULL),(463,'CORONEL CARLOS CONCHA TORRES',64,8,NULL,'PENDING',NULL,NULL),(464,'CHINCA',64,8,NULL,'PENDING',NULL,NULL),(465,'MAJUA',64,8,NULL,'PENDING',NULL,NULL),(466,'SAN MATEO',64,8,NULL,'PENDING',NULL,NULL),(467,'TABIAZO',64,8,NULL,'PENDING',NULL,NULL),(468,'TACHINA',64,8,NULL,'PENDING',NULL,NULL),(469,'VUELTA LARGA',64,8,NULL,'PENDING',NULL,NULL),(470,'VALDEZ',65,8,NULL,'PENDING',NULL,NULL),(471,'ANCHAYACU',65,8,NULL,'PENDING',NULL,NULL),(472,'ATAHUALPA',65,8,NULL,'PENDING',NULL,NULL),(473,'BORBÓN',65,8,NULL,'PENDING',NULL,NULL),(474,'LA TOLA',65,8,NULL,'PENDING',NULL,NULL),(475,'LUIS VARGAS TORRES',65,8,NULL,'PENDING',NULL,NULL),(476,'MALDONADO',65,8,NULL,'PENDING',NULL,NULL),(477,'PAMPANAL DE BOLÍVAR',65,8,NULL,'PENDING',NULL,NULL),(478,'SAN FRANCISCO DE ONZOLE',65,8,NULL,'PENDING',NULL,NULL),(479,'SANTO DOMINGO DE ONZOLE',65,8,NULL,'PENDING',NULL,NULL),(480,'SELVA ALEGRE',65,8,NULL,'PENDING',NULL,NULL),(481,'TELEMBÍ',65,8,NULL,'PENDING',NULL,NULL),(482,'COLÓN ELOY DEL MARÍA',65,8,NULL,'PENDING',NULL,NULL),(483,'SAN JOSÉ DE CAYAPAS',65,8,NULL,'PENDING',NULL,NULL),(484,'TIMBIRÉ',65,8,NULL,'PENDING',NULL,NULL),(485,'SANTA LUCÍA DE LAS PEÑAS',65,8,NULL,'PENDING',NULL,NULL),(486,'MUISNE',66,8,NULL,'PENDING',NULL,NULL),(487,'BOLÍVAR',66,8,NULL,'PENDING',NULL,NULL),(488,'DAULE',66,8,NULL,'PENDING',NULL,NULL),(489,'GALERA',66,8,NULL,'PENDING',NULL,NULL),(490,'QUINGUE',66,8,NULL,'PENDING',NULL,NULL),(491,'SÁLIMA',66,8,NULL,'PENDING',NULL,NULL),(492,'SAN FRANCISCO',66,8,NULL,'PENDING',NULL,NULL),(493,'SAN GREGORIO',66,8,NULL,'PENDING',NULL,NULL),(494,'SAN JOSÉ DE CHAMANGA',66,8,NULL,'PENDING',NULL,NULL),(495,'ROSA ZÁRATE',67,8,NULL,'PENDING',NULL,NULL),(496,'CUBE',67,8,NULL,'PENDING',NULL,NULL),(497,'CHURA',67,8,NULL,'PENDING',NULL,NULL),(498,'MALIMPIA',67,8,NULL,'PENDING',NULL,NULL),(499,'VICHE',67,8,NULL,'PENDING',NULL,NULL),(500,'LA UNIÓN',67,8,NULL,'PENDING',NULL,NULL),(501,'SAN LORENZO',68,8,NULL,'PENDING',NULL,NULL),(502,'ALTO TAMBO',68,8,NULL,'PENDING',NULL,NULL),(503,'ANCÓN',68,8,NULL,'PENDING',NULL,NULL),(504,'CALDERÓN',68,8,NULL,'PENDING',NULL,NULL),(505,'CARONDELET',68,8,NULL,'PENDING',NULL,NULL),(506,'5 DE JUNIO',68,8,NULL,'PENDING',NULL,NULL),(507,'CONCEPCIÓN',68,8,NULL,'PENDING',NULL,NULL),(508,'MATAJE',68,8,NULL,'PENDING',NULL,NULL),(509,'SAN JAVIER DE CACHAVÍ',68,8,NULL,'PENDING',NULL,NULL),(510,'SANTA RITA',68,8,NULL,'PENDING',NULL,NULL),(511,'TAMBILLO',68,8,NULL,'PENDING',NULL,NULL),(512,'TULULBÍ',68,8,NULL,'PENDING',NULL,NULL),(513,'URBINA',68,8,NULL,'PENDING',NULL,NULL),(514,'ATACAMES',69,8,NULL,'PENDING',NULL,NULL),(515,'LA UNIÓN',69,8,NULL,'PENDING',NULL,NULL),(516,'SÚA',69,8,NULL,'PENDING',NULL,NULL),(517,'TONCHIGÜE',69,8,NULL,'PENDING',NULL,NULL),(518,'TONSUPA',69,8,NULL,'PENDING',NULL,NULL),(519,'RIOVERDE',212,8,NULL,'PENDING',NULL,NULL),(520,'CHONTADURO',212,8,NULL,'PENDING',NULL,NULL),(521,'CHUMUNDÉ',212,8,NULL,'PENDING',NULL,NULL),(522,'LAGARTO',212,8,NULL,'PENDING',NULL,NULL),(523,'MONTALVO',212,8,NULL,'PENDING',NULL,NULL),(524,'ROCAFUERTE',212,8,NULL,'PENDING',NULL,NULL),(525,'GUAYAQUIL',70,9,NULL,'PENDING',NULL,NULL),(526,'JUAN GÓMEZ RENDÓN',70,9,NULL,'PENDING',NULL,NULL),(527,'MORRO',70,9,NULL,'PENDING',NULL,NULL),(528,'POSORJA',70,9,NULL,'PENDING',NULL,NULL),(529,'PUNÁ',70,9,NULL,'PENDING',NULL,NULL),(530,'TENGUEL',70,9,NULL,'PENDING',NULL,NULL),(531,'ALFREDO BAQUERIZO MORENO (JUJÁN)',71,9,NULL,'PENDING',NULL,NULL),(532,'BALAO',72,9,NULL,'PENDING',NULL,NULL),(533,'BALZAR',73,9,NULL,'PENDING',NULL,NULL),(534,'COLIMES',74,9,NULL,'PENDING',NULL,NULL),(535,'SAN JACINTO',74,9,NULL,'PENDING',NULL,NULL),(536,'DAULE',75,9,NULL,'PENDING',NULL,NULL),(537,'JUAN BAUTISTA AGUIRRE',75,9,NULL,'PENDING',NULL,NULL),(538,'LAUREL',75,9,NULL,'PENDING',NULL,NULL),(539,'LIMONAL',75,9,NULL,'PENDING',NULL,NULL),(540,'LOS LOJAS',75,9,NULL,'PENDING',NULL,NULL),(541,'ELOY ALFARO',76,9,NULL,'PENDING',NULL,NULL),(542,'VELASCO IBARRA',77,9,NULL,'PENDING',NULL,NULL),(543,'GUAYAS',77,9,NULL,'PENDING',NULL,NULL),(544,'EL ROSARIO',77,9,NULL,'PENDING',NULL,NULL),(545,'EL TRIUNFO',78,9,NULL,'PENDING',NULL,NULL),(546,'MILAGRO',79,9,NULL,'PENDING',NULL,NULL),(547,'CHOBO',79,9,NULL,'PENDING',NULL,NULL),(548,'MARISCAL SUCRE',79,9,NULL,'PENDING',NULL,NULL),(549,'ROBERTO ASTUDILLO',79,9,NULL,'PENDING',NULL,NULL),(550,'NARANJAL',80,9,NULL,'PENDING',NULL,NULL),(551,'JESÚS MARÍA',80,9,NULL,'PENDING',NULL,NULL),(552,'SAN CARLOS',80,9,NULL,'PENDING',NULL,NULL),(553,'SANTA ROSA DE FLANDES',80,9,NULL,'PENDING',NULL,NULL),(554,'TAURA',80,9,NULL,'PENDING',NULL,NULL),(555,'NARANJITO',81,9,NULL,'PENDING',NULL,NULL),(556,'PALESTINA',82,9,NULL,'PENDING',NULL,NULL),(557,'PEDRO CARBO',83,9,NULL,'PENDING',NULL,NULL),(558,'VALLE DE LA VIRGEN',83,9,NULL,'PENDING',NULL,NULL),(559,'SABANILLA',83,9,NULL,'PENDING',NULL,NULL),(560,'SAMBORONDÓN',85,9,NULL,'PENDING',NULL,NULL),(561,'TARIFA',85,9,NULL,'PENDING',NULL,NULL),(562,'SANTA LUCÍA',87,9,NULL,'PENDING',NULL,NULL),(563,'EL SALITRE',233,9,NULL,'PENDING',NULL,NULL),(564,'GENERAL VERNAZA',233,9,NULL,'PENDING',NULL,NULL),(565,'LA VICTORIA',233,9,NULL,'PENDING',NULL,NULL),(566,'JUNQUILLAL',233,9,NULL,'PENDING',NULL,NULL),(567,'SAN JACINTO DE YAGUACHI',89,9,NULL,'PENDING',NULL,NULL),(568,'GENERAL PEDRO J. MONTERO',89,9,NULL,'PENDING',NULL,NULL),(569,'YAGUACHI VIEJO',89,9,NULL,'PENDING',NULL,NULL),(570,'VIRGEN DE FÁTIMA',89,9,NULL,'PENDING',NULL,NULL),(571,'GENERAL VILLAMIL',90,9,NULL,'PENDING',NULL,NULL),(572,'SIMÓN BOLÍVAR',91,9,NULL,'PENDING',NULL,NULL),(573,'CORONEL LORENZO DE GARAYCOA',91,9,NULL,'PENDING',NULL,NULL),(574,'CORONEL MARCELINO MARIDUEÑA',92,9,NULL,'PENDING',NULL,NULL),(575,'LOMAS DE SARGENTILLO',93,9,NULL,'PENDING',NULL,NULL),(576,'NARCISA DE JESÚS',94,9,NULL,'PENDING',NULL,NULL),(577,'GENERAL ANTONIO ELIZALDE',96,9,NULL,'PENDING',NULL,NULL),(578,'ISIDRO AYORA',213,9,NULL,'PENDING',NULL,NULL),(579,'SAN MIGUEL DE IBARRA',97,10,NULL,'PENDING',NULL,NULL),(580,'AMBUQUÍ',97,10,NULL,'PENDING',NULL,NULL),(581,'ANGOCHAGUA',97,10,NULL,'PENDING',NULL,NULL),(582,'LA CAROLINA',97,10,NULL,'PENDING',NULL,NULL),(583,'LA ESPERANZA',97,10,NULL,'PENDING',NULL,NULL),(584,'LITA',97,10,NULL,'PENDING',NULL,NULL),(585,'SALINAS',97,10,NULL,'PENDING',NULL,NULL),(586,'SAN ANTONIO',97,10,NULL,'PENDING',NULL,NULL),(587,'ATUNTAQUI',98,10,NULL,'PENDING',NULL,NULL),(588,'IMBAYA',98,10,NULL,'PENDING',NULL,NULL),(589,'SAN FRANCISCO DE NATABUELA',98,10,NULL,'PENDING',NULL,NULL),(590,'SAN JOSÉ DE CHALTURA',98,10,NULL,'PENDING',NULL,NULL),(591,'SAN ROQUE',98,10,NULL,'PENDING',NULL,NULL),(592,'COTACACHI',99,10,NULL,'PENDING',NULL,NULL),(593,'APUELA',99,10,NULL,'PENDING',NULL,NULL),(594,'GARCÍA MORENO',99,10,NULL,'PENDING',NULL,NULL),(595,'IMANTAG',99,10,NULL,'PENDING',NULL,NULL),(596,'PEÑAHERRERA',99,10,NULL,'PENDING',NULL,NULL),(597,'PLAZA GUTIÉRREZ',99,10,NULL,'PENDING',NULL,NULL),(598,'QUIROGA',99,10,NULL,'PENDING',NULL,NULL),(599,'SEIS DE JULIO DE CUELLAJE',99,10,NULL,'PENDING',NULL,NULL),(600,'VACAS GALINDO',99,10,NULL,'PENDING',NULL,NULL),(601,'OTAVALO',100,10,NULL,'PENDING',NULL,NULL),(602,'DR. MIGUEL EGAS CABEZAS',100,10,NULL,'PENDING',NULL,NULL),(603,'EUGENIO ESPEJO',100,10,NULL,'PENDING',NULL,NULL),(604,'GONZÁLEZ SUÁREZ',100,10,NULL,'PENDING',NULL,NULL),(605,'PATAQUÍ',100,10,NULL,'PENDING',NULL,NULL),(606,'SAN JOSÉ DE QUICHINCHE',100,10,NULL,'PENDING',NULL,NULL),(607,'SAN JUAN DE ILUMÁN',100,10,NULL,'PENDING',NULL,NULL),(608,'SAN PABLO',100,10,NULL,'PENDING',NULL,NULL),(609,'SAN RAFAEL',100,10,NULL,'PENDING',NULL,NULL),(610,'SELVA ALEGRE',100,10,NULL,'PENDING',NULL,NULL),(611,'PIMAMPIRO',101,10,NULL,'PENDING',NULL,NULL),(612,'CHUGÁ',101,10,NULL,'PENDING',NULL,NULL),(613,'MARIANO ACOSTA',101,10,NULL,'PENDING',NULL,NULL),(614,'SAN FRANCISCO DE SIGSIPAMBA',101,10,NULL,'PENDING',NULL,NULL),(615,'URCUQUÍ',102,10,NULL,'PENDING',NULL,NULL),(616,'CAHUASQUÍ',102,10,NULL,'PENDING',NULL,NULL),(617,'LA MERCED DE BUENOS AIRES',102,10,NULL,'PENDING',NULL,NULL),(618,'PABLO ARENAS',102,10,NULL,'PENDING',NULL,NULL),(619,'SAN BLAS',102,10,NULL,'PENDING',NULL,NULL),(620,'TUMBABIRO',102,10,NULL,'PENDING',NULL,NULL),(621,'LOJA',103,11,NULL,'PENDING',NULL,NULL),(622,'CHANTACO',103,11,NULL,'PENDING',NULL,NULL),(623,'CHUQUIRIBAMBA',103,11,NULL,'PENDING',NULL,NULL),(624,'EL CISNE',103,11,NULL,'PENDING',NULL,NULL),(625,'GUALEL',103,11,NULL,'PENDING',NULL,NULL),(626,'JIMBILLA',103,11,NULL,'PENDING',NULL,NULL),(627,'MALACATOS',103,11,NULL,'PENDING',NULL,NULL),(628,'SAN LUCAS',103,11,NULL,'PENDING',NULL,NULL),(629,'SAN PEDRO DE VILCABAMBA',103,11,NULL,'PENDING',NULL,NULL),(630,'SANTIAGO',103,11,NULL,'PENDING',NULL,NULL),(631,'TAQUIL',103,11,NULL,'PENDING',NULL,NULL),(632,'VILCABAMBA',103,11,NULL,'PENDING',NULL,NULL),(633,'YANGANA',103,11,NULL,'PENDING',NULL,NULL),(634,'QUINARA',103,11,NULL,'PENDING',NULL,NULL),(635,'CARIAMANGA',104,11,NULL,'PENDING',NULL,NULL),(636,'COLAISACA',104,11,NULL,'PENDING',NULL,NULL),(637,'EL LUCERO',104,11,NULL,'PENDING',NULL,NULL),(638,'UTUANA',104,11,NULL,'PENDING',NULL,NULL),(639,'SANGUILLÍN',104,11,NULL,'PENDING',NULL,NULL),(640,'CATAMAYO',105,11,NULL,'PENDING',NULL,NULL),(641,'EL TAMBO',105,11,NULL,'PENDING',NULL,NULL),(642,'GUAYQUICHUMA',105,11,NULL,'PENDING',NULL,NULL),(643,'SAN PEDRO DE LA BENDITA',105,11,NULL,'PENDING',NULL,NULL),(644,'ZAMBI',105,11,NULL,'PENDING',NULL,NULL),(645,'CELICA',106,11,NULL,'PENDING',NULL,NULL),(646,'CRUZPAMBA',106,11,NULL,'PENDING',NULL,NULL),(647,'PÓZUL',106,11,NULL,'PENDING',NULL,NULL),(648,'SABANILLA',106,11,NULL,'PENDING',NULL,NULL),(649,'TENIENTE MAXIMILIANO RODRÍGUEZ LOAIZA',106,11,NULL,'PENDING',NULL,NULL),(650,'CHAGUARPAMBA',107,11,NULL,'PENDING',NULL,NULL),(651,'BUENAVISTA',107,11,NULL,'PENDING',NULL,NULL),(652,'EL ROSARIO',107,11,NULL,'PENDING',NULL,NULL),(653,'SANTA RUFINA',107,11,NULL,'PENDING',NULL,NULL),(654,'AMARILLOS',107,11,NULL,'PENDING',NULL,NULL),(655,'AMALUZA',108,11,NULL,'PENDING',NULL,NULL),(656,'BELLAVISTA',108,11,NULL,'PENDING',NULL,NULL),(657,'JIMBURA',108,11,NULL,'PENDING',NULL,NULL),(658,'SANTA TERESITA',108,11,NULL,'PENDING',NULL,NULL),(659,'27 DE ABRIL',108,11,NULL,'PENDING',NULL,NULL),(660,'EL INGENIO',108,11,NULL,'PENDING',NULL,NULL),(661,'EL AIRO',108,11,NULL,'PENDING',NULL,NULL),(662,'GONZANAMÁ',109,11,NULL,'PENDING',NULL,NULL),(663,'CHANGAIMINA',109,11,NULL,'PENDING',NULL,NULL),(664,'NAMBACOLA',109,11,NULL,'PENDING',NULL,NULL),(665,'PURUNUMA',109,11,NULL,'PENDING',NULL,NULL),(666,'SACAPALCA',109,11,NULL,'PENDING',NULL,NULL),(667,'MACARÁ',110,11,NULL,'PENDING',NULL,NULL),(668,'LARAMA',110,11,NULL,'PENDING',NULL,NULL),(669,'LA VICTORIA',110,11,NULL,'PENDING',NULL,NULL),(670,'SABIANGO',110,11,NULL,'PENDING',NULL,NULL),(671,'CATACOCHA',111,11,NULL,'PENDING',NULL,NULL),(672,'CANGONAMÁ',111,11,NULL,'PENDING',NULL,NULL),(673,'GUACHANAMÁ',111,11,NULL,'PENDING',NULL,NULL),(674,'LAURO GUERRERO',111,11,NULL,'PENDING',NULL,NULL),(675,'ORIANGA',111,11,NULL,'PENDING',NULL,NULL),(676,'SAN ANTONIO',111,11,NULL,'PENDING',NULL,NULL),(677,'CASANGA',111,11,NULL,'PENDING',NULL,NULL),(678,'YAMANA',111,11,NULL,'PENDING',NULL,NULL),(679,'ALAMOR',112,11,NULL,'PENDING',NULL,NULL),(680,'CIANO',112,11,NULL,'PENDING',NULL,NULL),(681,'EL ARENAL',112,11,NULL,'PENDING',NULL,NULL),(682,'EL LIMO',112,11,NULL,'PENDING',NULL,NULL),(683,'MERCADILLO',112,11,NULL,'PENDING',NULL,NULL),(684,'VICENTINO',112,11,NULL,'PENDING',NULL,NULL),(685,'SARAGURO',113,11,NULL,'PENDING',NULL,NULL),(686,'EL PARAÍSO DE CELEN',113,11,NULL,'PENDING',NULL,NULL),(687,'EL TABLÓN',113,11,NULL,'PENDING',NULL,NULL),(688,'LLUZHAPA',113,11,NULL,'PENDING',NULL,NULL),(689,'MANÚ',113,11,NULL,'PENDING',NULL,NULL),(690,'SAN ANTONIO DE QUMBE',113,11,NULL,'PENDING',NULL,NULL),(691,'SAN PABLO DE TENTA',113,11,NULL,'PENDING',NULL,NULL),(692,'SAN SEBASTIÁN DE YÚLUC',113,11,NULL,'PENDING',NULL,NULL),(693,'SELVA ALEGRE',113,11,NULL,'PENDING',NULL,NULL),(694,'URDANETA',113,11,NULL,'PENDING',NULL,NULL),(695,'SUMAYPAMBA',113,11,NULL,'PENDING',NULL,NULL),(696,'SOZORANGA',114,11,NULL,'PENDING',NULL,NULL),(697,'NUEVA FÁTIMA',114,11,NULL,'PENDING',NULL,NULL),(698,'TACAMOROS',114,11,NULL,'PENDING',NULL,NULL),(699,'ZAPOTILLO',115,11,NULL,'PENDING',NULL,NULL),(700,'MANGAHURCO',115,11,NULL,'PENDING',NULL,NULL),(701,'GARZAREAL',115,11,NULL,'PENDING',NULL,NULL),(702,'LIMONES',115,11,NULL,'PENDING',NULL,NULL),(703,'PALETILLAS',115,11,NULL,'PENDING',NULL,NULL),(704,'BOLASPAMBA',115,11,NULL,'PENDING',NULL,NULL),(705,'CAZADEROS',115,11,NULL,'PENDING',NULL,NULL),(706,'PINDAL',116,11,NULL,'PENDING',NULL,NULL),(707,'CHAQUINAL',116,11,NULL,'PENDING',NULL,NULL),(708,'12 DE DICIEMBRE',116,11,NULL,'PENDING',NULL,NULL),(709,'MILAGROS',116,11,NULL,'PENDING',NULL,NULL),(710,'QUILANGA',117,11,NULL,'PENDING',NULL,NULL),(711,'FUNDOCHAMBA',117,11,NULL,'PENDING',NULL,NULL),(712,'SAN ANTONIO DE LAS ARADAS',117,11,NULL,'PENDING',NULL,NULL),(713,'OLMEDO',214,11,NULL,'PENDING',NULL,NULL),(714,'LA TINGUE',214,11,NULL,'PENDING',NULL,NULL),(715,'BABAHOYO',118,12,NULL,'PENDING',NULL,NULL),(716,'CARACOL',118,12,NULL,'PENDING',NULL,NULL),(717,'FEBRES CORDERO',118,12,NULL,'PENDING',NULL,NULL),(718,'PIMOCHA',118,12,NULL,'PENDING',NULL,NULL),(719,'LA UNIÓN',118,12,NULL,'PENDING',NULL,NULL),(720,'BABA',119,12,NULL,'PENDING',NULL,NULL),(721,'GUARE',119,12,NULL,'PENDING',NULL,NULL),(722,'ISLA DE BEJUCAL',119,12,NULL,'PENDING',NULL,NULL),(723,'MONTALVO',120,12,NULL,'PENDING',NULL,NULL),(724,'LA ESMERALDA',120,12,NULL,'PENDING',NULL,NULL),(725,'PUEBLOVIEJO',121,12,NULL,'PENDING',NULL,NULL),(726,'PUERTO PECHICHE',121,12,NULL,'PENDING',NULL,NULL),(727,'SAN JUAN',121,12,NULL,'PENDING',NULL,NULL),(728,'QUEVEDO',122,12,NULL,'PENDING',NULL,NULL),(729,'SAN CARLOS',122,12,NULL,'PENDING',NULL,NULL),(730,'LA ESPERANZA',122,12,NULL,'PENDING',NULL,NULL),(731,'CATARAMA',123,12,NULL,'PENDING',NULL,NULL),(732,'RICAURTE',123,12,NULL,'PENDING',NULL,NULL),(733,'VENTANAS',124,12,NULL,'PENDING',NULL,NULL),(734,'ZAPOTAL',124,12,NULL,'PENDING',NULL,NULL),(735,'CHACARITA',124,12,NULL,'PENDING',NULL,NULL),(736,'LOS ÁNGELES',124,12,NULL,'PENDING',NULL,NULL),(737,'VINCES',125,12,NULL,'PENDING',NULL,NULL),(738,'ANTONIO SOTOMAYOR',125,12,NULL,'PENDING',NULL,NULL),(739,'PALENQUE',126,12,NULL,'PENDING',NULL,NULL),(740,'SAN JACINTO DE BUENA FE',127,12,NULL,'PENDING',NULL,NULL),(741,'PATRICIA PILAR',127,12,NULL,'PENDING',NULL,NULL),(742,'VALENCIA',128,12,NULL,'PENDING',NULL,NULL),(743,'MOCACHE',215,12,NULL,'PENDING',NULL,NULL),(744,'QUINSALOMA',3,12,NULL,'PENDING',NULL,NULL),(745,'PORTOVIEJO',129,13,NULL,'PENDING',NULL,NULL),(746,'ABDÓN CALDERÓN',129,13,NULL,'PENDING',NULL,NULL),(747,'ALHAJUELA',129,13,NULL,'PENDING',NULL,NULL),(748,'CRUCITA',129,13,NULL,'PENDING',NULL,NULL),(749,'PUEBLO NUEVO',129,13,NULL,'PENDING',NULL,NULL),(750,'RIOCHICO',129,13,NULL,'PENDING',NULL,NULL),(751,'SAN PLÁCIDO',129,13,NULL,'PENDING',NULL,NULL),(752,'CHIRIJOS',129,13,NULL,'PENDING',NULL,NULL),(753,'CALCETA',130,13,NULL,'PENDING',NULL,NULL),(754,'MEMBRILLO',130,13,NULL,'PENDING',NULL,NULL),(755,'QUIROGA',130,13,NULL,'PENDING',NULL,NULL),(756,'CHONE',131,13,NULL,'PENDING',NULL,NULL),(757,'BOYACÁ',131,13,NULL,'PENDING',NULL,NULL),(758,'CANUTO',131,13,NULL,'PENDING',NULL,NULL),(759,'CONVENTO',131,13,NULL,'PENDING',NULL,NULL),(760,'CHIBUNGA',131,13,NULL,'PENDING',NULL,NULL),(761,'ELOY ALFARO',131,13,NULL,'PENDING',NULL,NULL),(762,'RICAURTE',131,13,NULL,'PENDING',NULL,NULL),(763,'SAN ANTONIO',131,13,NULL,'PENDING',NULL,NULL),(764,'EL CARMEN',132,13,NULL,'PENDING',NULL,NULL),(765,'WILFRIDO LOOR MOREIRA',132,13,NULL,'PENDING',NULL,NULL),(766,'SAN PEDRO DE SUMA',132,13,NULL,'PENDING',NULL,NULL),(767,'SANTA MARÍA',132,13,NULL,'PENDING',NULL,NULL),(768,'EL PARAÍSO LA 14',132,13,NULL,'PENDING',NULL,NULL),(769,'FLAVIO ALFARO',133,13,NULL,'PENDING',NULL,NULL),(770,'SAN FRANCISCO DE NOVILLO',133,13,NULL,'PENDING',NULL,NULL),(771,'ZAPALLO',133,13,NULL,'PENDING',NULL,NULL),(772,'JIPIJAPA',134,13,NULL,'PENDING',NULL,NULL),(773,'AMÉRICA',134,13,NULL,'PENDING',NULL,NULL),(774,'EL ANEGADO',134,13,NULL,'PENDING',NULL,NULL),(775,'JULCUY',134,13,NULL,'PENDING',NULL,NULL),(776,'LA UNIÓN',134,13,NULL,'PENDING',NULL,NULL),(777,'MEMBRILLAL',134,13,NULL,'PENDING',NULL,NULL),(778,'PEDRO PABLO GÓMEZ',134,13,NULL,'PENDING',NULL,NULL),(779,'PUERTO CAYO',134,13,NULL,'PENDING',NULL,NULL),(780,'JUNÍN',135,13,NULL,'PENDING',NULL,NULL),(781,'MANTA',136,13,NULL,'PENDING',NULL,NULL),(782,'SAN LORENZO',136,13,NULL,'PENDING',NULL,NULL),(783,'SANTA MARIANITA',136,13,NULL,'PENDING',NULL,NULL),(784,'MONTECRISTI',137,13,NULL,'PENDING',NULL,NULL),(785,'LA PILA',137,13,NULL,'PENDING',NULL,NULL),(786,'PAJÁN',138,13,NULL,'PENDING',NULL,NULL),(787,'CAMPOZANO',138,13,NULL,'PENDING',NULL,NULL),(788,'CASCOL',138,13,NULL,'PENDING',NULL,NULL),(789,'GUALE',138,13,NULL,'PENDING',NULL,NULL),(790,'LASCANO',138,13,NULL,'PENDING',NULL,NULL),(791,'PICHINCHA',139,13,NULL,'PENDING',NULL,NULL),(792,'BARRAGANETE',139,13,NULL,'PENDING',NULL,NULL),(793,'SAN SEBASTIÁN',139,13,NULL,'PENDING',NULL,NULL),(794,'ROCAFUERTE',140,13,NULL,'PENDING',NULL,NULL),(795,'SOSOTE',140,13,NULL,'PENDING',NULL,NULL),(796,'SANTA ANA DE VUELTA LARGA',141,13,NULL,'PENDING',NULL,NULL),(797,'AYACUCHO',141,13,NULL,'PENDING',NULL,NULL),(798,'HONORATO VÁSQUEZ',141,13,NULL,'PENDING',NULL,NULL),(799,'LA UNIÓN',141,13,NULL,'PENDING',NULL,NULL),(800,'SAN PABLO',141,13,NULL,'PENDING',NULL,NULL),(801,'BAHÍA DE CARÁQUEZ',142,13,NULL,'PENDING',NULL,NULL),(802,'CHARAPOTÓ',142,13,NULL,'PENDING',NULL,NULL),(803,'SAN ISIDRO',142,13,NULL,'PENDING',NULL,NULL),(804,'TOSAGUA',143,13,NULL,'PENDING',NULL,NULL),(805,'BACHILLERO',143,13,NULL,'PENDING',NULL,NULL),(806,'ÁNGEL PEDRO GILER',143,13,NULL,'PENDING',NULL,NULL),(807,'SUCRE',144,13,NULL,'PENDING',NULL,NULL),(808,'BELLAVISTA',144,13,NULL,'PENDING',NULL,NULL),(809,'NOBOA',144,13,NULL,'PENDING',NULL,NULL),(810,'ARQUITECTO SIXTO DURÁN BALLÉN',144,13,NULL,'PENDING',NULL,NULL),(811,'PEDERNALES',145,13,NULL,'PENDING',NULL,NULL),(812,'COJIMÍES',145,13,NULL,'PENDING',NULL,NULL),(813,'DIEZ DE AGOSTO',145,13,NULL,'PENDING',NULL,NULL),(814,'ATAHUALPA',145,13,NULL,'PENDING',NULL,NULL),(815,'OLMEDO',146,13,NULL,'PENDING',NULL,NULL),(816,'PUERTO LÓPEZ',147,13,NULL,'PENDING',NULL,NULL),(817,'MACHALILLA',147,13,NULL,'PENDING',NULL,NULL),(818,'SALANGO',147,13,NULL,'PENDING',NULL,NULL),(819,'JAMA',216,13,NULL,'PENDING',NULL,NULL),(820,'JARAMIJÓ',217,13,NULL,'PENDING',NULL,NULL),(821,'SAN VICENTE',218,13,NULL,'PENDING',NULL,NULL),(822,'CANOA',218,13,NULL,'PENDING',NULL,NULL),(823,'MACAS',28,14,NULL,'PENDING',NULL,NULL),(824,'ALSHI',28,14,NULL,'PENDING',NULL,NULL),(825,'GENERAL PROAÑO',28,14,NULL,'PENDING',NULL,NULL),(826,'SAN ISIDRO',28,14,NULL,'PENDING',NULL,NULL),(827,'SINAÍ',28,14,NULL,'PENDING',NULL,NULL),(828,'ZUÑA',28,14,NULL,'PENDING',NULL,NULL),(829,'CUCHAENTZA',28,14,NULL,'PENDING',NULL,NULL),(830,'RÍO BLANCO',28,14,NULL,'PENDING',NULL,NULL),(831,'ZONA EN ESTUDIO INTERPARROQUIAL SINAÍ-CUCHAENTZA',28,14,NULL,'PENDING',NULL,NULL),(832,'GUALAQUIZA',29,14,NULL,'PENDING',NULL,NULL),(833,'AMAZONAS',29,14,NULL,'PENDING',NULL,NULL),(834,'BERMEJOS',29,14,NULL,'PENDING',NULL,NULL),(835,'BOMBOÍZA',29,14,NULL,'PENDING',NULL,NULL),(836,'CHIGÜINDA',29,14,NULL,'PENDING',NULL,NULL),(837,'EL ROSARIO',29,14,NULL,'PENDING',NULL,NULL),(838,'NUEVA TARQUI',29,14,NULL,'PENDING',NULL,NULL),(839,'SAN MIGUEL DE CUYES',29,14,NULL,'PENDING',NULL,NULL),(840,'EL IDEAL',29,14,NULL,'PENDING',NULL,NULL),(841,'GENERAL LEONIDAS PLAZA GUTIÉRREZ',30,14,NULL,'PENDING',NULL,NULL),(842,'INDANZA',30,14,NULL,'PENDING',NULL,NULL),(843,'SAN ANTONIO',30,14,NULL,'PENDING',NULL,NULL),(844,'SAN MIGUEL DE CONCHAY',30,14,NULL,'PENDING',NULL,NULL),(845,'SANTA SUSANA DE CHIVIAZA',30,14,NULL,'PENDING',NULL,NULL),(846,'YUNGANZA',30,14,NULL,'PENDING',NULL,NULL),(847,'PALORA',31,14,NULL,'PENDING',NULL,NULL),(848,'ARAPICOS',31,14,NULL,'PENDING',NULL,NULL),(849,'CUMANDÁ',31,14,NULL,'PENDING',NULL,NULL),(850,'SANGAY',31,14,NULL,'PENDING',NULL,NULL),(851,'16 DE AGOSTO',31,14,NULL,'PENDING',NULL,NULL),(852,'SANTIAGO DE MÉNDEZ',32,14,NULL,'PENDING',NULL,NULL),(853,'COPAL',32,14,NULL,'PENDING',NULL,NULL),(854,'CHUPIANZA',32,14,NULL,'PENDING',NULL,NULL),(855,'PATUCA',32,14,NULL,'PENDING',NULL,NULL),(856,'SAN LUIS DE EL ACHO',32,14,NULL,'PENDING',NULL,NULL),(857,'TAYUZA',32,14,NULL,'PENDING',NULL,NULL),(858,'SAN FRANCISCO DE CHINIMBIMI',32,14,NULL,'PENDING',NULL,NULL),(859,'SUCÚA',33,14,NULL,'PENDING',NULL,NULL),(860,'ASUNCIÓN',33,14,NULL,'PENDING',NULL,NULL),(861,'HUAMBI',33,14,NULL,'PENDING',NULL,NULL),(862,'SANTA MARIANITA DE JESÚS',33,14,NULL,'PENDING',NULL,NULL),(863,'HUAMBOYA',208,14,NULL,'PENDING',NULL,NULL),(864,'CHIGUAZA',208,14,NULL,'PENDING',NULL,NULL),(865,'SAN JUAN BOSCO',209,14,NULL,'PENDING',NULL,NULL),(866,'PAN DE AZÚCAR',209,14,NULL,'PENDING',NULL,NULL),(867,'SAN CARLOS DE LIMÓN',209,14,NULL,'PENDING',NULL,NULL),(868,'SAN JACINTO DE WAKAMBEIS',209,14,NULL,'PENDING',NULL,NULL),(869,'SANTIAGO DE PANANZA',209,14,NULL,'PENDING',NULL,NULL),(870,'TAISHA',219,14,NULL,'PENDING',NULL,NULL),(871,'HUASAGA',219,14,NULL,'PENDING',NULL,NULL),(872,'MACUMA',219,14,NULL,'PENDING',NULL,NULL),(873,'TUUTINENTSA',219,14,NULL,'PENDING',NULL,NULL),(874,'PUMPUENTSA',219,14,NULL,'PENDING',NULL,NULL),(875,'LOGROÑO',220,14,NULL,'PENDING',NULL,NULL),(876,'YAUPI',220,14,NULL,'PENDING',NULL,NULL),(877,'SHIMPIS',220,14,NULL,'PENDING',NULL,NULL),(878,'PABLO SEXTO',221,14,NULL,'PENDING',NULL,NULL),(879,'SANTIAGO',222,14,NULL,'PENDING',NULL,NULL),(880,'SAN JOSÉ DE MORONA',222,14,NULL,'PENDING',NULL,NULL),(881,'SEVILLA DON BOSCO',28,14,NULL,'PENDING',NULL,NULL),(882,'TENA',148,15,NULL,'PENDING',NULL,NULL),(883,'AHUANO',148,15,NULL,'PENDING',NULL,NULL),(884,'CHONTAPUNTA',148,15,NULL,'PENDING',NULL,NULL),(885,'PANO',148,15,NULL,'PENDING',NULL,NULL),(886,'PUERTO MISAHUALLÍ',148,15,NULL,'PENDING',NULL,NULL),(887,'PUERTO NAPO',148,15,NULL,'PENDING',NULL,NULL),(888,'TÁLAG',148,15,NULL,'PENDING',NULL,NULL),(889,'SAN JUAN DE MUYUNA',148,15,NULL,'PENDING',NULL,NULL),(890,'ARCHIDONA',150,15,NULL,'PENDING',NULL,NULL),(891,'COTUNDO',150,15,NULL,'PENDING',NULL,NULL),(892,'SAN PABLO DE USHPAYACU',150,15,NULL,'PENDING',NULL,NULL),(893,'HATUN SUMAKU',150,15,NULL,'PENDING',NULL,NULL),(894,'EL CHACO',151,15,NULL,'PENDING',NULL,NULL),(895,'GONZALO DÍAZ DE PINEDA',151,15,NULL,'PENDING',NULL,NULL),(896,'LINARES',151,15,NULL,'PENDING',NULL,NULL),(897,'OYACACHI',151,15,NULL,'PENDING',NULL,NULL),(898,'SANTA ROSA',151,15,NULL,'PENDING',NULL,NULL),(899,'SARDINAS',151,15,NULL,'PENDING',NULL,NULL),(900,'BAEZA',154,15,NULL,'PENDING',NULL,NULL),(901,'COSANGA',154,15,NULL,'PENDING',NULL,NULL),(902,'CUYUJA',154,15,NULL,'PENDING',NULL,NULL),(903,'PAPALLACTA',154,15,NULL,'PENDING',NULL,NULL),(904,'SAN FRANCISCO DE BORJA',154,15,NULL,'PENDING',NULL,NULL),(905,'SUMACO',154,15,NULL,'PENDING',NULL,NULL),(906,'CARLOS JULIO AROSEMENA TOLA',223,15,NULL,'PENDING',NULL,NULL),(907,'PUYO',156,16,NULL,'PENDING',NULL,NULL),(908,'CANELOS',156,16,NULL,'PENDING',NULL,NULL),(909,'DIEZ DE AGOSTO',156,16,NULL,'PENDING',NULL,NULL),(910,'FÁTIMA',156,16,NULL,'PENDING',NULL,NULL),(911,'MONTALVO',156,16,NULL,'PENDING',NULL,NULL),(912,'POMONA',156,16,NULL,'PENDING',NULL,NULL),(913,'RÍO CORRIENTES',156,16,NULL,'PENDING',NULL,NULL),(914,'RÍO TIGRE',156,16,NULL,'PENDING',NULL,NULL),(915,'SARAYACU',156,16,NULL,'PENDING',NULL,NULL),(916,'SIMÓN BOLÍVAR',156,16,NULL,'PENDING',NULL,NULL),(917,'TARQUI',156,16,NULL,'PENDING',NULL,NULL),(918,'TENIENTE HUGO ORTIZ',156,16,NULL,'PENDING',NULL,NULL),(919,'VERACRUZ',156,16,NULL,'PENDING',NULL,NULL),(920,'EL TRIUNFO',156,16,NULL,'PENDING',NULL,NULL),(921,'MERA',157,16,NULL,'PENDING',NULL,NULL),(922,'MADRE TIERRA',157,16,NULL,'PENDING',NULL,NULL),(923,'SHELL',157,16,NULL,'PENDING',NULL,NULL),(924,'SANTA CLARA',158,16,NULL,'PENDING',NULL,NULL),(925,'SAN JOSÉ',158,16,NULL,'PENDING',NULL,NULL),(926,'ARAJUNO',224,16,NULL,'PENDING',NULL,NULL),(927,'CURARAY',224,16,NULL,'PENDING',NULL,NULL),(928,'QUITO',159,17,NULL,'PENDING',NULL,NULL),(929,'ALANGASÍ',159,17,NULL,'PENDING',NULL,NULL),(930,'AMAGUAÑA',159,17,NULL,'PENDING',NULL,NULL),(931,'ATAHUALPA',159,17,NULL,'PENDING',NULL,NULL),(932,'CALACALÍ',159,17,NULL,'PENDING',NULL,NULL),(933,'CALDERÓN',159,17,NULL,'PENDING',NULL,NULL),(934,'CONOCOTO',159,17,NULL,'PENDING',NULL,NULL),(935,'CUMBAYÁ',159,17,NULL,'PENDING',NULL,NULL),(936,'CHAVEZPAMBA',159,17,NULL,'PENDING',NULL,NULL),(937,'CHECA',159,17,NULL,'PENDING',NULL,NULL),(938,'EL QUINCHE',159,17,NULL,'PENDING',NULL,NULL),(939,'GUALEA',159,17,NULL,'PENDING',NULL,NULL),(940,'GUANGOPOLO',159,17,NULL,'PENDING',NULL,NULL),(941,'GUAYLLABAMBA',159,17,NULL,'PENDING',NULL,NULL),(942,'LA MERCED',159,17,NULL,'PENDING',NULL,NULL),(943,'LLANO CHICO',159,17,NULL,'PENDING',NULL,NULL),(944,'LLOA',159,17,NULL,'PENDING',NULL,NULL),(945,'NANEGAL',159,17,NULL,'PENDING',NULL,NULL),(946,'NANEGALITO',159,17,NULL,'PENDING',NULL,NULL),(947,'NAYÓN',159,17,NULL,'PENDING',NULL,NULL),(948,'NONO',159,17,NULL,'PENDING',NULL,NULL),(949,'PACTO',159,17,NULL,'PENDING',NULL,NULL),(950,'PERUCHO',159,17,NULL,'PENDING',NULL,NULL),(951,'PIFO',159,17,NULL,'PENDING',NULL,NULL),(952,'PÍNTAG',159,17,NULL,'PENDING',NULL,NULL),(953,'POMASQUI',159,17,NULL,'PENDING',NULL,NULL),(954,'PUÉLLARO',159,17,NULL,'PENDING',NULL,NULL),(955,'PUEMBO',159,17,NULL,'PENDING',NULL,NULL),(956,'SAN ANTONIO',159,17,NULL,'PENDING',NULL,NULL),(957,'SAN JOSÉ DE MINAS',159,17,NULL,'PENDING',NULL,NULL),(958,'TABABELA',159,17,NULL,'PENDING',NULL,NULL),(959,'TUMBACO',159,17,NULL,'PENDING',NULL,NULL),(960,'YARUQUÍ',159,17,NULL,'PENDING',NULL,NULL),(961,'ZÁMBIZA',159,17,NULL,'PENDING',NULL,NULL),(962,'CAYAMBE',160,17,NULL,'PENDING',NULL,NULL),(963,'ASCÁZUBI',160,17,NULL,'PENDING',NULL,NULL),(964,'CANGAHUA',160,17,NULL,'PENDING',NULL,NULL),(965,'OLMEDO',160,17,NULL,'PENDING',NULL,NULL),(966,'OTÓN',160,17,NULL,'PENDING',NULL,NULL),(967,'SANTA ROSA DE CUZUBAMBA',160,17,NULL,'PENDING',NULL,NULL),(968,'SAN JOSÉ DE AYORA',160,17,NULL,'PENDING',NULL,NULL),(969,'JUAN MONTALVO',160,17,NULL,'PENDING',NULL,NULL),(970,'MACHACHI',161,17,NULL,'PENDING',NULL,NULL),(971,'ALOAG',161,17,NULL,'PENDING',NULL,NULL),(972,'ALOASÍ',161,17,NULL,'PENDING',NULL,NULL),(973,'CUTUGLAHUA',161,17,NULL,'PENDING',NULL,NULL),(974,'EL CHAUPI',161,17,NULL,'PENDING',NULL,NULL),(975,'MANUEL CORNEJO ASTORGA',161,17,NULL,'PENDING',NULL,NULL),(976,'TAMBILLO',161,17,NULL,'PENDING',NULL,NULL),(977,'UYUMBICHO',161,17,NULL,'PENDING',NULL,NULL),(978,'TABACUNDO',162,17,NULL,'PENDING',NULL,NULL),(979,'LA ESPERANZA',162,17,NULL,'PENDING',NULL,NULL),(980,'MALCHINGUÍ',162,17,NULL,'PENDING',NULL,NULL),(981,'TOCACHI',162,17,NULL,'PENDING',NULL,NULL),(982,'TUPIGACHI',162,17,NULL,'PENDING',NULL,NULL),(983,'SAN MIGUEL DE LOS BANCOS',165,17,NULL,'PENDING',NULL,NULL),(984,'MINDO',165,17,NULL,'PENDING',NULL,NULL),(985,'PEDRO VICENTE MALDONADO',166,17,NULL,'PENDING',NULL,NULL),(986,'PUERTO QUITO',167,17,NULL,'PENDING',NULL,NULL),(987,'AMBATO',168,18,NULL,'PENDING',NULL,NULL),(988,'AMBATILLO',168,18,NULL,'PENDING',NULL,NULL),(989,'ATAHUALPA',168,18,NULL,'PENDING',NULL,NULL),(990,'AUGUSTO N. MARTÍNEZ',168,18,NULL,'PENDING',NULL,NULL),(991,'CONSTANTINO FERNÁNDEZ',168,18,NULL,'PENDING',NULL,NULL),(992,'HUACHI GRANDE',168,18,NULL,'PENDING',NULL,NULL),(993,'IZAMBA',168,18,NULL,'PENDING',NULL,NULL),(994,'JUAN BENIGNO VELA',168,18,NULL,'PENDING',NULL,NULL),(995,'MONTALVO',168,18,NULL,'PENDING',NULL,NULL),(996,'PASA',168,18,NULL,'PENDING',NULL,NULL),(997,'PICAIHUA',168,18,NULL,'PENDING',NULL,NULL),(998,'PILAGÜÍN',168,18,NULL,'PENDING',NULL,NULL),(999,'QUISAPINCHA',168,18,NULL,'PENDING',NULL,NULL),(1000,'SAN BARTOLOMÉ DE PINLLO',168,18,NULL,'PENDING',NULL,NULL),(1001,'SAN FERNANDO',168,18,NULL,'PENDING',NULL,NULL),(1002,'SANTA ROSA',168,18,NULL,'PENDING',NULL,NULL),(1003,'TOTORAS',168,18,NULL,'PENDING',NULL,NULL),(1004,'CUNCHIBAMBA',168,18,NULL,'PENDING',NULL,NULL),(1005,'UNAMUNCHO',168,18,NULL,'PENDING',NULL,NULL),(1006,'BAÑOS',169,18,NULL,'PENDING',NULL,NULL),(1007,'LLIGUA',169,18,NULL,'PENDING',NULL,NULL),(1008,'RÍO NEGRO',169,18,NULL,'PENDING',NULL,NULL),(1009,'RÍO VERDE',169,18,NULL,'PENDING',NULL,NULL),(1010,'ULBA',169,18,NULL,'PENDING',NULL,NULL),(1011,'CEVALLOS',170,18,NULL,'PENDING',NULL,NULL),(1012,'MOCHA',171,18,NULL,'PENDING',NULL,NULL),(1013,'PINGUILÍ',171,18,NULL,'PENDING',NULL,NULL),(1014,'PATATE',172,18,NULL,'PENDING',NULL,NULL),(1015,'EL TRIUNFO',172,18,NULL,'PENDING',NULL,NULL),(1016,'LOS ANDES',172,18,NULL,'PENDING',NULL,NULL),(1017,'SUCRE',172,18,NULL,'PENDING',NULL,NULL),(1018,'QUERO',173,18,NULL,'PENDING',NULL,NULL),(1019,'RUMIPAMBA',173,18,NULL,'PENDING',NULL,NULL),(1020,'YANAYACU MOCHAPATA',173,18,NULL,'PENDING',NULL,NULL),(1021,'PELILEO',174,18,NULL,'PENDING',NULL,NULL),(1022,'BENÍTEZ',174,18,NULL,'PENDING',NULL,NULL),(1023,'BOLÍVAR',174,18,NULL,'PENDING',NULL,NULL),(1024,'COTALÓ',174,18,NULL,'PENDING',NULL,NULL),(1025,'CHIQUICHA',174,18,NULL,'PENDING',NULL,NULL),(1026,'EL ROSARIO',174,18,NULL,'PENDING',NULL,NULL),(1027,'GARCÍA MORENO',174,18,NULL,'PENDING',NULL,NULL),(1028,'GUAMBALÓ',174,18,NULL,'PENDING',NULL,NULL),(1029,'SALASACA',174,18,NULL,'PENDING',NULL,NULL),(1030,'PÍLLARO',225,18,NULL,'PENDING',NULL,NULL),(1031,'BAQUERIZO MORENO',225,18,NULL,'PENDING',NULL,NULL),(1032,'EMILIO MARÍA TERÁN',225,18,NULL,'PENDING',NULL,NULL),(1033,'MARCOS ESPINEL',225,18,NULL,'PENDING',NULL,NULL),(1034,'PRESIDENTE URBINA',225,18,NULL,'PENDING',NULL,NULL),(1035,'SAN ANDRÉS',225,18,NULL,'PENDING',NULL,NULL),(1036,'SAN JOSÉ DE POALÓ',225,18,NULL,'PENDING',NULL,NULL),(1037,'SAN MIGUELITO',225,18,NULL,'PENDING',NULL,NULL),(1038,'TISALEO',175,18,NULL,'PENDING',NULL,NULL),(1039,'QUINCHICOTO',175,18,NULL,'PENDING',NULL,NULL),(1040,'ZAMORA',176,19,NULL,'PENDING',NULL,NULL),(1041,'CUMBARATZA',176,19,NULL,'PENDING',NULL,NULL),(1042,'GUADALUPE',176,19,NULL,'PENDING',NULL,NULL),(1043,'IMBANA',176,19,NULL,'PENDING',NULL,NULL),(1044,'SABANILLA',176,19,NULL,'PENDING',NULL,NULL),(1045,'TIMBARA',176,19,NULL,'PENDING',NULL,NULL),(1046,'SAN CARLOS DE LAS MINAS',176,19,NULL,'PENDING',NULL,NULL),(1047,'ZUMBA',177,19,NULL,'PENDING',NULL,NULL),(1048,'CHITO',177,19,NULL,'PENDING',NULL,NULL),(1049,'EL CHORRO',177,19,NULL,'PENDING',NULL,NULL),(1050,'LA CHONTA',177,19,NULL,'PENDING',NULL,NULL),(1051,'PUCAPAMBA',177,19,NULL,'PENDING',NULL,NULL),(1052,'SAN ANDRÉS',177,19,NULL,'PENDING',NULL,NULL),(1053,'GUAYZIMI',178,19,NULL,'PENDING',NULL,NULL),(1054,'ZURMI',178,19,NULL,'PENDING',NULL,NULL),(1055,'NUEVO PARAÍSO',178,19,NULL,'PENDING',NULL,NULL),(1056,'NANKAIS',178,19,NULL,'PENDING',NULL,NULL),(1057,'28 DE MAYO',179,19,NULL,'PENDING',NULL,NULL),(1058,'LA PAZ',179,19,NULL,'PENDING',NULL,NULL),(1059,'TUTUPALI',179,19,NULL,'PENDING',NULL,NULL),(1060,'YANTZAZA',180,19,NULL,'PENDING',NULL,NULL),(1061,'CHICAÑA',180,19,NULL,'PENDING',NULL,NULL),(1062,'LOS ENCUENTROS',180,19,NULL,'PENDING',NULL,NULL),(1063,'EL PANGUI',181,19,NULL,'PENDING',NULL,NULL),(1064,'EL GUISME',181,19,NULL,'PENDING',NULL,NULL),(1065,'PACHICUTZA',181,19,NULL,'PENDING',NULL,NULL),(1066,'TUNDAYME',181,19,NULL,'PENDING',NULL,NULL),(1067,'ZUMBI',182,19,NULL,'PENDING',NULL,NULL),(1068,'TRIUNFO DORADO',182,19,NULL,'PENDING',NULL,NULL),(1069,'PANGUINTZA',182,19,NULL,'PENDING',NULL,NULL),(1070,'PALANDA',226,19,NULL,'PENDING',NULL,NULL),(1071,'EL PORVENIR DEL CARMEN',226,19,NULL,'PENDING',NULL,NULL),(1072,'SAN FRANCISCO DEL VERGEL',226,19,NULL,'PENDING',NULL,NULL),(1073,'VALLADOLID',226,19,NULL,'PENDING',NULL,NULL),(1074,'LA CANELA',226,19,NULL,'PENDING',NULL,NULL),(1075,'PAQUISHA',227,19,NULL,'PENDING',NULL,NULL),(1076,'BELLAVISTA',227,19,NULL,'PENDING',NULL,NULL),(1077,'NUEVO QUITO',227,19,NULL,'PENDING',NULL,NULL),(1078,'PUERTO BAQUERIZO MORENO',183,20,NULL,'PENDING',NULL,NULL),(1079,'EL PROGRESO',183,20,NULL,'PENDING',NULL,NULL),(1080,'ISLA SANTA MARÍA FLOREANA',183,20,NULL,'PENDING',NULL,NULL),(1081,'PUERTO VILLAMIL',184,20,NULL,'PENDING',NULL,NULL),(1082,'TOMÁS DE BERLANGA',184,20,NULL,'PENDING',NULL,NULL),(1083,'PUERTO AYORA',185,20,NULL,'PENDING',NULL,NULL),(1084,'BELLA VISTA',185,20,NULL,'PENDING',NULL,NULL),(1085,'SANTA ROSA',185,20,NULL,'PENDING',NULL,NULL),(1086,'NUEVA LOJA',186,21,NULL,'PENDING',NULL,NULL),(1087,'DURENO',186,21,NULL,'PENDING',NULL,NULL),(1088,'GENERAL FARFÁN',186,21,NULL,'PENDING',NULL,NULL),(1089,'EL ENO',186,21,NULL,'PENDING',NULL,NULL),(1090,'PACAYACU',186,21,NULL,'PENDING',NULL,NULL),(1091,'JAMBELÍ',186,21,NULL,'PENDING',NULL,NULL),(1092,'SANTA CECILIA',186,21,NULL,'PENDING',NULL,NULL),(1093,'10 DE AGOSTO',186,21,NULL,'PENDING',NULL,NULL),(1094,'LUMBAQUÍ',187,21,NULL,'PENDING',NULL,NULL),(1095,'EL REVENTADOR',187,21,NULL,'PENDING',NULL,NULL),(1096,'GONZALO PIZARRO',187,21,NULL,'PENDING',NULL,NULL),(1097,'PUERTO LIBRE',187,21,NULL,'PENDING',NULL,NULL),(1098,'PUERTO EL CARMEN DE PUTUMAYO',188,21,NULL,'PENDING',NULL,NULL),(1099,'PALMA ROJA',188,21,NULL,'PENDING',NULL,NULL),(1100,'PUERTO BOLÍVAR',188,21,NULL,'PENDING',NULL,NULL),(1101,'PUERTO RODRÍGUEZ',188,21,NULL,'PENDING',NULL,NULL),(1102,'SANTA ELENA',188,21,NULL,'PENDING',NULL,NULL),(1103,'SANSAHUARI',188,21,NULL,'PENDING',NULL,NULL),(1104,'SHUSHUFINDI',189,21,NULL,'PENDING',NULL,NULL),(1105,'LIMONCOCHA',189,21,NULL,'PENDING',NULL,NULL),(1106,'PAÑACOCHA',189,21,NULL,'PENDING',NULL,NULL),(1107,'SAN ROQUE',189,21,NULL,'PENDING',NULL,NULL),(1108,'SAN PEDRO DE LOS COFÁNES',189,21,NULL,'PENDING',NULL,NULL),(1109,'SIETE DE JULIO',189,21,NULL,'PENDING',NULL,NULL),(1110,'LA MAGDALENA',189,21,NULL,'PENDING',NULL,NULL),(1111,'LA PRIMAVERA',189,21,NULL,'PENDING',NULL,NULL),(1112,'LA BONITA',190,21,NULL,'PENDING',NULL,NULL),(1113,'EL PLAYÓN DE SAN FRANCISCO',190,21,NULL,'PENDING',NULL,NULL),(1114,'LA SOFÍA',190,21,NULL,'PENDING',NULL,NULL),(1115,'ROSA FLORIDA',190,21,NULL,'PENDING',NULL,NULL),(1116,'SANTA BÁRBARA',190,21,NULL,'PENDING',NULL,NULL),(1117,'EL DORADO DE CASCALES',191,21,NULL,'PENDING',NULL,NULL),(1118,'SANTA ROSA DE SUCUMBÍOS',191,21,NULL,'PENDING',NULL,NULL),(1119,'SEVILLA',191,21,NULL,'PENDING',NULL,NULL),(1120,'NUEVA TRONCAL',191,21,NULL,'PENDING',NULL,NULL),(1121,'TARAPOA',228,21,NULL,'PENDING',NULL,NULL),(1122,'CUYABENO',228,21,NULL,'PENDING',NULL,NULL),(1123,'AGUAS NEGRAS',228,21,NULL,'PENDING',NULL,NULL),(1124,'EL COCA',229,22,NULL,'PENDING',NULL,NULL),(1125,'DAYUMA',229,22,NULL,'PENDING',NULL,NULL),(1126,'TARACOA',229,22,NULL,'PENDING',NULL,NULL),(1127,'ALEJANDRO LABAKA',229,22,NULL,'PENDING',NULL,NULL),(1128,'EL DORADO',229,22,NULL,'PENDING',NULL,NULL),(1129,'EL EDÉN',229,22,NULL,'PENDING',NULL,NULL),(1130,'GARCÍA MORENO',229,22,NULL,'PENDING',NULL,NULL),(1131,'INÉS ARANGO',229,22,NULL,'PENDING',NULL,NULL),(1132,'LA BELLEZA',229,22,NULL,'PENDING',NULL,NULL),(1133,'NUEVO PARAÍSO',229,22,NULL,'PENDING',NULL,NULL),(1134,'SAN JOSÉ DE GUAYUSA',229,22,NULL,'PENDING',NULL,NULL),(1135,'SAN LUIS DE ARMENIA',229,22,NULL,'PENDING',NULL,NULL),(1136,'NUEVO ROCAFUERTE',230,22,NULL,'PENDING',NULL,NULL),(1137,'CAPITÁN AUGUSTO RIVADENEYRA',230,22,NULL,'PENDING',NULL,NULL),(1138,'CONONACO',230,22,NULL,'PENDING',NULL,NULL),(1139,'SANTA MARÍA DE HUIRIRIMA',230,22,NULL,'PENDING',NULL,NULL),(1140,'YASUNÍ',230,22,NULL,'PENDING',NULL,NULL),(1141,'LA JOYA DE LOS SACHAS',231,22,NULL,'PENDING',NULL,NULL),(1142,'ENOKANQUI',231,22,NULL,'PENDING',NULL,NULL),(1143,'POMPEYA',231,22,NULL,'PENDING',NULL,NULL),(1144,'SAN CARLOS',231,22,NULL,'PENDING',NULL,NULL),(1145,'SAN SEBASTIÁN DEL COCA',231,22,NULL,'PENDING',NULL,NULL),(1146,'LAGO SAN PEDRO',231,22,NULL,'PENDING',NULL,NULL),(1147,'RUMIPAMBA',231,22,NULL,'PENDING',NULL,NULL),(1148,'TRES DE NOVIEMBRE',231,22,NULL,'PENDING',NULL,NULL),(1149,'UNIÓN MILAGREÑA',231,22,NULL,'PENDING',NULL,NULL),(1150,'LORETO',232,22,NULL,'PENDING',NULL,NULL),(1151,'ÁVILA',232,22,NULL,'PENDING',NULL,NULL),(1152,'PUERTO MURIALDO',232,22,NULL,'PENDING',NULL,NULL),(1153,'SAN JOSÉ DE PAYAMINO',232,22,NULL,'PENDING',NULL,NULL),(1154,'SAN JOSÉ DE DAHUANO',232,22,NULL,'PENDING',NULL,NULL),(1155,'SAN VICENTE DE HUATICOCHA',232,22,NULL,'PENDING',NULL,NULL),(1156,'SANTO DOMINGO DE LOS COLORADOS',6,23,NULL,'PENDING',NULL,NULL),(1157,'ALLURIQUÍN',6,23,NULL,'PENDING',NULL,NULL),(1158,'PUERTO LIMÓN',6,23,NULL,'PENDING',NULL,NULL),(1159,'LUZ DE AMÉRICA',6,23,NULL,'PENDING',NULL,NULL),(1160,'SAN JACINTO DEL BÚA',6,23,NULL,'PENDING',NULL,NULL),(1161,'VALLE HERMOSO',6,23,NULL,'PENDING',NULL,NULL),(1162,'EL ESFUERZO',6,23,NULL,'PENDING',NULL,NULL),(1163,'SANTA MARÍA DEL TOACHI',6,23,NULL,'PENDING',NULL,NULL),(1164,'LA CONCORDIA',454,23,NULL,'PENDING',NULL,NULL),(1165,'MONTERREY',454,23,NULL,'PENDING',NULL,NULL),(1166,'LA VILLEGAS',454,23,NULL,'PENDING',NULL,NULL),(1167,'PLAN PILOTO',454,23,NULL,'PENDING',NULL,NULL),(1168,'SANTA ELENA',5,24,NULL,'PENDING',NULL,NULL),(1169,'ATAHUALPA',5,24,NULL,'PENDING',NULL,NULL),(1170,'COLONCHE',5,24,NULL,'PENDING',NULL,NULL),(1171,'CHANDUY',5,24,NULL,'PENDING',NULL,NULL),(1172,'MANGLARALTO',5,24,NULL,'PENDING',NULL,NULL),(1173,'SIMÓN BOLÍVAR',5,24,NULL,'PENDING',NULL,NULL),(1174,'SAN JOSÉ DE ANCÓN',5,24,NULL,'PENDING',NULL,NULL),(1175,'LA LIBERTAD',2,24,NULL,'PENDING',NULL,NULL),(1176,'SALINAS',4,24,NULL,'PENDING',NULL,NULL),(1177,'ANCONCITO',4,24,NULL,'PENDING',NULL,NULL),(1178,'JOSÉ LUIS TAMAYO',4,24,NULL,'PENDING',NULL,NULL);
/*!40000 ALTER TABLE `parroquias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal`
--

DROP TABLE IF EXISTS `personal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal` (
  `id_personal` int NOT NULL AUTO_INCREMENT,
  `nombres` varchar(150) NOT NULL,
  `apellidos` varchar(150) NOT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `estado_disponibilidad` varchar(50) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id_personal`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal`
--

LOCK TABLES `personal` WRITE;
/*!40000 ALTER TABLE `personal` DISABLE KEYS */;
INSERT INTO `personal` VALUES (1,'Andrés','Mora','admin','disponible','Calle Falsa 123','0999999999','amora','364e2456-fb07-11f0-b60b-0a0027000003','synced','2026-01-26 22:34:44','local','$2a$10$P5OgDNeSS.PEgPQnB/1.LO8QKftSXmqBLfU1Lr4N.CrRp4VTJA1ee'),(2,'Fernanda','Vasquez','medico','disponible','Av. Central 456','0888888888','fvasquez','36540ca7-fb07-11f0-b60b-0a0027000003','synced','2026-01-26 22:34:44','local','$2a$10$P5OgDNeSS.PEgPQnB/1.LO8QKftSXmqBLfU1Lr4N.CrRp4VTJA1ee');
/*!40000 ALTER TABLE `personal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pieles_faneras`
--

DROP TABLE IF EXISTS `pieles_faneras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pieles_faneras` (
  `id_piel_fanera` int NOT NULL AUTO_INCREMENT,
  `id_examen_fisico_segmentario` int NOT NULL,
  `icterisia` tinyint(1) DEFAULT '0',
  `psianosis` tinyint(1) DEFAULT '0',
  `rash` tinyint(1) DEFAULT '0',
  `otros` varchar(150) DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  PRIMARY KEY (`id_piel_fanera`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pieles_faneras`
--

LOCK TABLES `pieles_faneras` WRITE;
/*!40000 ALTER TABLE `pieles_faneras` DISABLE KEYS */;
/*!40000 ALTER TABLE `pieles_faneras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planes_terapeuticos`
--

DROP TABLE IF EXISTS `planes_terapeuticos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planes_terapeuticos` (
  `id_plan_terapeutico` int NOT NULL AUTO_INCREMENT,
  `manejo_farmacologico` varchar(50) DEFAULT NULL,
  `manejo_no_farmacologico` varchar(50) DEFAULT NULL,
  `pronostico` varchar(20) DEFAULT NULL,
  `id_consulta` int NOT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_plan_terapeutico`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planes_terapeuticos`
--

LOCK TABLES `planes_terapeuticos` WRITE;
/*!40000 ALTER TABLE `planes_terapeuticos` DISABLE KEYS */;
/*!40000 ALTER TABLE `planes_terapeuticos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provincias`
--

DROP TABLE IF EXISTS `provincias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provincias` (
  `id_provincia` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_provincia`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provincias`
--

LOCK TABLES `provincias` WRITE;
/*!40000 ALTER TABLE `provincias` DISABLE KEYS */;
INSERT INTO `provincias` VALUES (1,'Azuay',NULL,'PENDING',NULL,NULL),(2,'Bolivar',NULL,'PENDING',NULL,NULL),(3,'Cañar',NULL,'PENDING',NULL,NULL),(4,'Carchi',NULL,'PENDING',NULL,NULL),(5,'Cotopaxi',NULL,'PENDING',NULL,NULL),(6,'Chimborazo',NULL,'PENDING',NULL,NULL),(7,'El Oro',NULL,'PENDING',NULL,NULL),(8,'Esmeraldas',NULL,'PENDING',NULL,NULL),(9,'Guayas',NULL,'PENDING',NULL,NULL),(10,'Imbabura',NULL,'PENDING',NULL,NULL),(11,'Loja',NULL,'PENDING',NULL,NULL),(12,'Los Rios',NULL,'PENDING',NULL,NULL),(13,'Manabi',NULL,'PENDING',NULL,NULL),(14,'Morona Santiago',NULL,'PENDING',NULL,NULL),(15,'Napo',NULL,'PENDING',NULL,NULL),(16,'Pastaza',NULL,'PENDING',NULL,NULL),(17,'Pichincha',NULL,'PENDING',NULL,NULL),(18,'Tungurahua',NULL,'PENDING',NULL,NULL),(19,'Zamora Chinchipe',NULL,'PENDING',NULL,NULL),(20,'Galapagos',NULL,'PENDING',NULL,NULL),(21,'Sucumbios',NULL,'PENDING',NULL,NULL),(22,'Orellana',NULL,'PENDING',NULL,NULL),(23,'Santo Domingo de los Tsachilas',NULL,'PENDING',NULL,NULL),(24,'Santa Elena',NULL,'PENDING',NULL,NULL),(90,'Zonas no delimitadas',NULL,'PENDING',NULL,NULL),(99,'Extranjero',NULL,'PENDING',NULL,NULL);
/*!40000 ALTER TABLE `provincias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `signos_vitales`
--

DROP TABLE IF EXISTS `signos_vitales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `signos_vitales` (
  `id_signo_vital` int NOT NULL AUTO_INCREMENT,
  `peso` decimal(5,2) DEFAULT NULL,
  `talla_longitud` decimal(5,2) DEFAULT NULL,
  `perimetro_cefalico` decimal(5,2) DEFAULT NULL,
  `temperatura` decimal(4,1) DEFAULT NULL,
  `frecuencia_cardiaca` int DEFAULT NULL,
  `frecuencia_respiratoria` int DEFAULT NULL,
  `presion_arterial_sistolica` int DEFAULT NULL,
  `presion_arterial_diastolica` int DEFAULT NULL,
  `saturacion_oxigeno` int DEFAULT NULL,
  `IMC` decimal(5,2) DEFAULT NULL,
  `puntuacionz` varchar(50) DEFAULT NULL,
  `observacion` varchar(50) DEFAULT NULL,
  `id_examen_fisico` int DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `id_personal` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_signo_vital`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `signos_vitales`
--

LOCK TABLES `signos_vitales` WRITE;
/*!40000 ALTER TABLE `signos_vitales` DISABLE KEYS */;
/*!40000 ALTER TABLE `signos_vitales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tutores`
--

DROP TABLE IF EXISTS `tutores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tutores` (
  `id_tutor` int NOT NULL AUTO_INCREMENT,
  `primer_nombre` varchar(100) DEFAULT NULL,
  `segundo_nombre` varchar(100) DEFAULT NULL,
  `primer_apellido` varchar(100) DEFAULT NULL,
  `segundo_apellido` varchar(100) DEFAULT NULL,
  `numero_contacto` varchar(30) DEFAULT NULL,
  `domicilio_actual` varchar(50) DEFAULT NULL,
  `nivel_educativo` varchar(100) DEFAULT NULL,
  `id_parroquia` int DEFAULT NULL,
  `id_prq_canton` int DEFAULT NULL,
  `id_prq_cnt_provincia` int DEFAULT NULL,
  `uuid_offline` varchar(36) DEFAULT NULL,
  `sync_status` varchar(20) DEFAULT 'PENDING',
  `last_modified` timestamp NULL DEFAULT NULL,
  `origin` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_tutor`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tutores`
--

LOCK TABLES `tutores` WRITE;
/*!40000 ALTER TABLE `tutores` DISABLE KEYS */;
INSERT INTO `tutores` VALUES (3,'angel','mora','nupia','salinas','0980534574','1-50 Calle Manuel Moreno Serrano','Postgrado',89,NULL,NULL,NULL,NULL,NULL,NULL),(4,'asd','mora','ccccc','salinas','0980534574','1-50 Calle Manuel Moreno Serrano','Postgrado',89,NULL,NULL,NULL,NULL,NULL,NULL),(5,'xxxx','mora','xxxx','salinas','0980534574','1-50 Calle Manuel Moreno Serrano','Postgrado',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,'ssss','mora','ssss','salinas','0980534574','1-50 Calle Manuel Moreno Serrano','Postgrado',103,NULL,NULL,NULL,NULL,NULL,NULL),(7,'Gladys','Guiracocha','','','0992978704','San Cristobal','Secundaria',781,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `tutores` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-19 14:49:34
