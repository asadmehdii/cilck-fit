CREATE TABLE IF NOT EXISTS `users` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) CHARACTER SET 'utf8mb4' NOT NULL,
  `password` VARCHAR(255) CHARACTER SET 'utf8mb4' NOT NULL,
  `type` VARCHAR(255) CHARACTER SET 'utf8mb4' NOT NULL,
  `active` TINYINT DEFAULT 1,
  PRIMARY KEY (`ID`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC)
);

DELIMITER $$

CREATE PROCEDURE `addUser`(
  IN p_email VARCHAR(255),
  IN p_password VARCHAR(255),
  IN p_type VARCHAR(255)
BEGIN
  INSERT INTO `users` (`email`, `password`, `type`, `active`)
  VALUES (p_email, p_password, p_type, 1);
END$$

DELIMITER ;

CALL addUser('admin@clickfit.com', '$2b$10$5v8s7d2f4g6h8j0k2l4m6n8o0p2q4r6t8u0v2w4x6y8z0a2b4c6d8e0f', 'admin');
CALL addUser('trainer@clickfit.com', '$2b$10$7x9y8z1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x', 'trainer');
CALL addUser('member@clickfit.com', '$2b$10$9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p3q2r1s0t9u8v7w6x5y4z', 'member');