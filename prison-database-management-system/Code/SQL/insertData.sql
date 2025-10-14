-- INSERTS

-- PrisonSecurity
INSERT INTO PrisonSecurity VALUES (5, 10000, 'Vancouver, BC');
INSERT INTO PrisonSecurity VALUES (10, 50000, 'Washington, DC');
INSERT INTO PrisonSecurity VALUES (1, 1000, 'Toronto, ON');
INSERT INTO PrisonSecurity VALUES (3, 1750, 'Surrey, BC');
INSERT INTO PrisonSecurity VALUES (7, 22000, 'Los Angeles, CA');
INSERT INTO PrisonSecurity VALUES (2, 3000, 'Calgary, AB');

-- PrisonInfo
INSERT INTO PrisonInfo VALUES (132, 5);
INSERT INTO PrisonInfo VALUES (101, 2);
INSERT INTO PrisonInfo VALUES (106, 7);
INSERT INTO PrisonInfo VALUES (192, 10);
INSERT INTO PrisonInfo VALUES (123, 1);

-- InmatesCell
INSERT INTO InmatesCell VALUES ('REGULAR', 2);
INSERT INTO InmatesCell VALUES ('DEATH ROW', 1);
INSERT INTO InmatesCell VALUES ('SOLITARY', 3);

-- InmatesInfo
INSERT INTO InmatesInfo VALUES (20000001, 'REGULAR', 1000001, TO_DATE('2025-01-22', 'YYYY-MM-DD'), TO_DATE('2030-01-22', 'YYYY-MM-DD'));
INSERT INTO InmatesInfo VALUES (20000021, 'DEATH ROW', 16702222, TO_DATE('2025-04-04', 'YYYY-MM-DD'), TO_DATE('2040-01-04', 'YYYY-MM-DD'));
INSERT INTO InmatesInfo VALUES (20000626, 'DEATH ROW', 19023567, TO_DATE('2020-09-02', 'YYYY-MM-DD'), TO_DATE('2034-09-04', 'YYYY-MM-DD'));
INSERT INTO InmatesInfo VALUES (20005502, 'SOLITARY', 15420213, TO_DATE('2021-05-18', 'YYYY-MM-DD'), TO_DATE('2036-05-19', 'YYYY-MM-DD'));
INSERT INTO InmatesInfo VALUES (20001237, 'REGULAR', 10111111, TO_DATE('1980-02-24', 'YYYY-MM-DD'), TO_DATE('2025-05-28', 'YYYY-MM-DD'));

-- MedicalData
INSERT INTO MedicalData VALUES (1000001, 'O-', 195, 'M', 189, 20000001);
INSERT INTO MedicalData VALUES (1000231, 'O+', 230, 'M', 170, 20000021);
INSERT INTO MedicalData VALUES (1000151, 'B-', 150, 'F', 156, 20000626);
INSERT INTO MedicalData VALUES (1000291, 'AB+', 220, 'F', 170, 20005502);
INSERT INTO MedicalData VALUES (1000901, 'A+', 160, 'M', 165, 20001237);

-- Club
INSERT INTO Club VALUES ('Fitness Club', 'Recreational');
INSERT INTO Club VALUES ('Book Club', 'Educational');
INSERT INTO Club VALUES ('Cooking Club', 'Culinary');
INSERT INTO Club VALUES ('Chess Club', 'Strategic');
INSERT INTO Club VALUES ('Music Club', 'Artistic');

-- Sentence
INSERT INTO Sentence VALUES (2.5, 'Assault with a deadly weapon', 'Assault', 7, 20000001);
INSERT INTO Sentence VALUES (0.5, 'Tax Fraud', 'Tax Invasion', 1, 20000021);
INSERT INTO Sentence VALUES (25, 'Double Homicide', 'Homicide', 9, 20000626);
INSERT INTO Sentence VALUES (3, 'Vehicle Manslaughter', 'Homicide', 5, 20005502);
INSERT INTO Sentence VALUES (5, 'Breaking-and-Entering', 'Assault', 6, 20001237);

-- Cells
INSERT INTO Cells VALUES (1002, 'DEATH ROW', 132);
INSERT INTO Cells VALUES (2002, 'REGULAR', 101);
INSERT INTO Cells VALUES (3002, 'SOLITARY', 106);
INSERT INTO Cells VALUES (2025, 'REGULAR', 192);
INSERT INTO Cells VALUES (2102, 'REGULAR', 123);

-- Amenities
INSERT INTO Amenities VALUES ('Physical', 'Gym', 'General Rec', 132);
INSERT INTO Amenities VALUES ('Physical', 'Pool', 'General Rec', 101);
INSERT INTO Amenities VALUES ('Education', 'Library', 'Learning', 106);
INSERT INTO Amenities VALUES ('Education', 'Computer Room', 'Electronics', 192);
INSERT INTO Amenities VALUES ('Entertainment', 'Cafeteria', 'Food and Entertainment', 123);

-- Employees
INSERT INTO Employees VALUES (10005, 'Cell Guard');
INSERT INTO Employees VALUES (10006, 'Solitary Confinement Guard');
INSERT INTO Employees VALUES (20002, 'Sous Chef');
INSERT INTO Employees VALUES (30002, 'Janitor');
INSERT INTO Employees VALUES (40023, 'Nurse');
INSERT INTO Employees VALUES (10007, 'West Guard');
INSERT INTO Employees VALUES (10008, 'North Guard');
INSERT INTO Employees VALUES (10009, 'East Guard');
INSERT INTO Employees VALUES (20003, 'Pizza Chef');
INSERT INTO Employees VALUES (20004, 'Chicken Chef');
INSERT INTO Employees VALUES (20005, 'Soup Chef');
INSERT INTO Employees VALUES (20008, 'Curry Chef');
INSERT INTO Employees VALUES (30005, 'Plumber');
INSERT INTO Employees VALUES (30007, 'Pipe Maintainer');
INSERT INTO Employees VALUES (30011, 'Custodian');
INSERT INTO Employees VALUES (40033, 'Pharmacy Assistant');
INSERT INTO Employees VALUES (40054, 'Patient Carer');
INSERT INTO Employees VALUES (40101, 'Doctor');
INSERT INTO Employees VALUES (40102, 'Pharmacologist');

-- WorksAt
INSERT INTO WorksAt VALUES (132, 10005, 100000);
INSERT INTO WorksAt VALUES (101, 10006, 70000);
INSERT INTO WorksAt VALUES (106, 20002, 50000);
INSERT INTO WorksAt VALUES (192, 30002, 40000);
INSERT INTO WorksAt VALUES (123, 40023, 60000);

-- Certification
INSERT INTO Certification VALUES ('Food Safety', 'Culinary', 20002);
INSERT INTO Certification VALUES ('Legal Studies', 'Policing', 10005);
INSERT INTO Certification VALUES ('Plumbing', 'Janitorial', 30002);
INSERT INTO Certification VALUES ('Police Academy', 'Policing', 10006);
INSERT INTO Certification VALUES ('Bachelors of Nursing', 'Nursing', 40023);

-- Guards
INSERT INTO Guards VALUES (10005, 'North Sector');
INSERT INTO Guards VALUES (10006, 'South Sector');
INSERT INTO Guards VALUES (10007, 'West Sector');
INSERT INTO Guards VALUES (10008, 'North Sector');
INSERT INTO Guards VALUES (10009, 'East Sector');

-- Chef
INSERT INTO Chef VALUES(20002, 'Mac N Cheese');
INSERT INTO Chef VALUES(20003, 'Pizza');
INSERT INTO Chef VALUES(20004, 'Chicken Breast');
INSERT INTO Chef VALUES(20005, 'Chicken Noodle Soup');
INSERT INTO Chef VALUES(20008, 'Rice and Curry');


-- Maintenance
INSERT INTO Maintenance VALUES(30002, 'Janitor');
INSERT INTO Maintenance VALUES(30005, 'Plumbing');
INSERT INTO Maintenance VALUES(30007, 'Pipes');
INSERT INTO Maintenance VALUES(30011, 'Custodian');

-- Medical
INSERT INTO Medical VALUES(40023, 'Nurse');
INSERT INTO Medical VALUES(40101, 'Doctor');
INSERT INTO Medical VALUES(40054, 'Patient Care');
INSERT INTO Medical VALUES(40102, 'Pharmacologist');
INSERT INTO Medical VALUES (40033, 'Pharmacy Assistant');