-- CREATED TABLES BASED ON MILESTONE 2
-- initialize.sql
-- DROP TABLES FIRST (in reverse dependency order)
DROP TABLE Medical CASCADE CONSTRAINTS;
DROP TABLE Maintenance CASCADE CONSTRAINTS;
DROP TABLE Chef CASCADE CONSTRAINTS;
DROP TABLE Guards CASCADE CONSTRAINTS;
DROP TABLE Certification CASCADE CONSTRAINTS;
DROP TABLE WorksAt CASCADE CONSTRAINTS;
DROP TABLE Employees CASCADE CONSTRAINTS;
DROP TABLE Amenities CASCADE CONSTRAINTS;
DROP TABLE Cells CASCADE CONSTRAINTS;
DROP TABLE Sentence CASCADE CONSTRAINTS;
DROP TABLE Club CASCADE CONSTRAINTS;
DROP TABLE MedicalData CASCADE CONSTRAINTS;
DROP TABLE InmatesInfo CASCADE CONSTRAINTS;
DROP TABLE InmatesCell CASCADE CONSTRAINTS;
DROP TABLE PrisonInfo CASCADE CONSTRAINTS;
DROP TABLE PrisonSecurity CASCADE CONSTRAINTS;

CREATE TABLE InmatesCell (
  HoldingCell varchar(50) PRIMARY KEY,
  CellLevel int
);

CREATE TABLE InmatesInfo (
  InmateID int NOT NULL,
  HoldingCell varchar(50),
  HealthNum int,
  StartDate date,
  EndDate date,
  PRIMARY KEY (InmateID),
  FOREIGN KEY (HoldingCell) REFERENCES InmatesCell ON DELETE CASCADE
);

CREATE TABLE MedicalData (
  RecordNum int,
  BloodType char(255),
  Weight int,
  Sex varchar(255),
  Height int,
  InmateID int,
  PRIMARY KEY (RecordNum, InmateID),
  FOREIGN KEY (InmateID) REFERENCES InmatesInfo ON DELETE CASCADE
);

CREATE TABLE Club (
  Name varchar(255) PRIMARY KEY,
  ClubType varchar(255)
);

CREATE TABLE Sentence (
  Duration NUMBER,
  Name char(50),
  Crime char(255),
  Severity int,
  InmateID int,
  PRIMARY KEY (Duration, Name, Crime),
  FOREIGN KEY (InmateID) REFERENCES InmatesInfo ON DELETE CASCADE
);

CREATE TABLE PrisonSecurity (
  SecurityLevel int PRIMARY KEY,
  NumGuards int,
  Location varchar(255)
);

CREATE TABLE PrisonInfo (
  PrisonNum int PRIMARY KEY,
  SecurityLevel int,
  FOREIGN KEY (SecurityLevel) REFERENCES PrisonSecurity ON DELETE CASCADE
);

CREATE TABLE Cells (
  CellNum int PRIMARY KEY,
  CellType varchar(255),
  PrisonNum int,
  FOREIGN KEY (PrisonNum) REFERENCES PrisonInfo
);

CREATE TABLE Amenities (
  AmenType varchar(255),
  Name varchar(255),
  Recreation varchar(255),
  PrisonNum int,
  PRIMARY KEY (AmenType, Name),
  FOREIGN KEY (PrisonNum) REFERENCES PrisonInfo ON DELETE CASCADE
);

CREATE TABLE Employees (
  EmpID int PRIMARY KEY NOT NULL,
  Name varchar(255)
);

CREATE TABLE WorksAt (
  PrisonNum int,
  EmpID int,
  Salary int,
  PRIMARY KEY (PrisonNum, EmpID),
  FOREIGN KEY (PrisonNum) REFERENCES PrisonInfo ON DELETE CASCADE,
  FOREIGN KEY (EmpID) REFERENCES Employees ON DELETE CASCADE
);

CREATE TABLE Certification (
  Certificate varchar(255) PRIMARY KEY,
  Skills varchar(255),
  EmpID int,
  FOREIGN KEY (EmpID) REFERENCES Employees ON DELETE CASCADE
);

CREATE TABLE Guards (
  EmpID int PRIMARY KEY,
  GuardArea varchar(255),
  FOREIGN KEY (EmpID) REFERENCES Employees ON DELETE CASCADE
);

CREATE TABLE Chef (
  EmpID int PRIMARY KEY,
  MealToCook varchar(255),
  FOREIGN KEY (EmpID) REFERENCES Employees ON DELETE CASCADE
);

CREATE TABLE Maintenance (
  EmpID int PRIMARY KEY,
  MaintenanceType varchar(255),
  FOREIGN KEY (EmpID) REFERENCES Employees ON DELETE CASCADE
);

CREATE TABLE Medical (
  EmpID int PRIMARY KEY,
  MedicalType varchar(255),
  FOREIGN KEY (EmpID) REFERENCES Employees ON DELETE CASCADE
);
