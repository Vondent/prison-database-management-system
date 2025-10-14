-- queries.sql
-- INSERT 
-- INSERT new Inmate into our database
INSERT INTO InmatesInfo VALUES (20007777, 'REGULAR', 1002345, TO_DATE('2025-03-15', 'YYYY-MM-DD'), TO_DATE('2030-03-15', 'YYYY-MM-DD'));
INSERT INTO Sentence VALUES (4.5, 'Grand Theft Auto', 'Theft', 6, 20007777);
INSERT INTO MedicalData VALUES (1001234, 'A-', 175, 'M', 180, 20007777);

-- DELETE
-- DELETE inmates who have completed their sentences (release date has passed)
DELETE FROM InmatesInfo WHERE EndDate < SYSDATE;

-- UPDATE
-- UPDATE Inmates who have good behaviour
UPDATE InmatesInfo
SET HoldingCell = 'SOLITARY'
WHERE InmateID = 20000001;

-- UPDATE inmates who have been sentenced solitary confinement (ex 20000001)
UPDATE InmatesInfo
SET EndDate = ADD_MONTHS(EndDate, -6)
WHERE InmateID IN (
    SELECT i.InmateID
    FROM InmatesInfo i
    JOIN Sentence s ON i.InmateID = s.InmateID
    WHERE s.Severity < 5
);

-- SELECTION
-- SELECT all inmates in Death Row
SELECT *
FROM InmatesInfo
WHERE HoldingCell = 'DEATH ROW';

-- PROJECTION
-- PROJECT only inmate IDs and their crime/durations in descending order
SELECT i.InmateID, s.Duration, s.Crime
FROM InmatesInfo i
JOIN Sentence s ON i.InmateID = s.InmateID
ORDER BY s.Duration DESC;

-- JOIN
-- JOIN inmates with their medical data and sentences in descending order
SELECT i.InmateID, i.HoldingCell, m.BloodType, m.Weight, m.Height, s.Crime, s.Duration
FROM InmatesInfo i
JOIN MedicalData m ON i.InmateID = m.InmateID
JOIN Sentence s ON i.InmateID = s.InmateID
ORDER BY s.Duration DESC;

-- AGGREGATION WITH GROUP BY
-- number of inmates GROUPED BY holding cell
SELECT HoldingCell, COUNT(*) AS InmateCount
FROM InmatesInfo
GROUP BY HoldingCell;

-- AGGREGATION WITH HAVING
-- AGGREGATE crime categories with average severity above 6
SELECT Crime, AVG(Severity) AS AverageSeverity, COUNT(*) AS CrimeCount
FROM Sentence
GROUP BY Crime
HAVING AVG(Severity) > 6
ORDER BY AverageSeverity DESC;

-- NESTED AGGRERGATION WITH GROUP BY
-- Find prisons with the highest number of high-severity inmates (severity > 7)
SELECT p.PrisonNum, COUNT(*) AS HighSeverityCount
FROM Cells c
JOIN PrisonInfo p ON c.PrisonNum = p.PrisonNum
JOIN InmatesCell ic ON c.CellType = ic.HoldingCell
JOIN InmatesInfo i ON ic.HoldingCell = i.HoldingCell
JOIN Sentence s ON i.InmateID = s.InmateID
WHERE s.Severity > 7
GROUP BY p.PrisonNum
HAVING COUNT(*) = (
    SELECT MAX(InmateCount)
    FROM (
        SELECT p2.PrisonNum, COUNT(*) AS InmateCount
        FROM Cells c2
        JOIN PrisonInfo p2 ON c2.PrisonNum = p2.PrisonNum
        JOIN InmatesCell ic2 ON c2.CellType = ic2.HoldingCell
        JOIN InmatesInfo i2 ON ic2.HoldingCell = i2.HoldingCell
        JOIN Sentence s2 ON i2.InmateID = s2.InmateID
        WHERE s2.Severity > 7
        GROUP BY p2.PrisonNum
    )
);

-- DIVISION
-- Find employees who work at all prisons with security level greater than 5
SELECT e.EmpID, e.Name
FROM Employees e
WHERE NOT EXISTS (
    SELECT p.PrisonNum
    FROM PrisonInfo p
    JOIN PrisonSecurity ps ON p.SecurityLevel = ps.SecurityLevel
    WHERE ps.SecurityLevel > 5
    AND NOT EXISTS (
        SELECT w.PrisonNum
        FROM WorksAt w
        WHERE w.EmpID = e.EmpID
        AND w.PrisonNum = p.PrisonNum
    )
);