/* Prison DBMS - appService.js */
const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

const fs = require('fs');
const path = require('path');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function fetchInmatesFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM InmateInfo');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// INITIALIZE ALL TABLES
async function initiateInmateTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE InmateInfo CASCADE CONSTRAINTS`);
        } catch (err) {
            console.log('InmateInfo table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE InmateInfo (
                InmateID NUMBER PRIMARY KEY,
                HoldingCell VARCHAR2(20) NOT NULL,
                HealthNum NUMBER NOT NULL,
                StartDate DATE NOT NULL,
                EndDate DATE NOT NULL,
                FOREIGN KEY (HoldingCell) REFERENCES InmatesCell ON DELETE CASCADE
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function initiateMedicalTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE MEDICAL CASCADE CONSTRAINTS`);
        } catch (err) {
            console.log('Medical table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE MedicalData (
                RecordNum NUMBER,
                BloodType VARCHAR2(20),
                Weight NUMBER,
                Height NUMBER,
                Sex VARCHAR2(20),
                InmateID NUMBER,
                PRIMARY KEY(RecordNum, InmateID),
                FOREIGN KEY(InmateID) REFERNCES InmatesInfo ON DELETE CASCADE
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function initiateClubTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE CLUB CASCADE CONSTRAINTS`);
        } catch (err) {
            console.log('Club table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE Club (
                Name VARCHAR2(255),
                ClubType VARCHAR(255)
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function initiateSentenceTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE Sentence CASCADE CONSTRAINTS`);
        } catch (err) {
            console.log('Sentence table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE Sentence (
                Duration NUMBER,
                Name VARCHAR2(50),
                Crime VARCHAR2(50),
                Severity NUMBER,
                InmateId NUMBER,
                PRIMARY KEY(Duration, Name, Crime),
                FOREIGN KEY(InmateID) REFERENCES InmatesInfo ON DELETE CASCADE
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function initiatePrisonSecurityTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE PrisonSecurity CASCADE CONSTRAINTS`);
        } catch (err) {
            console.log('PrisonSecurity table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE PrisonSecurity (
                SecurityLevel NUMBER PRIMARY KEY,
                NumGuards NUMBER,
                Location VARCHAR2(255)
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function initiatePrisonInfoTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE PrisonInfo CASCADE CONSTRAINTS`);
        } catch (err) {
            console.log('PrisonInfo table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE PrisonInfo (
                PrisonNum NUMBER PRIMARY KEY,
                SecurityLevel NUMBER,
                FOREIGN KEY (SecurityLevel) REREFERENCES PrisonSecurity ON DELETE CASCADE
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function initiateAmenititesTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE Amenities CASCADE CONSTRAINTS`);
        } catch (err) {
            console.log('Amenities table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE Amenities (
                AmenType VARCHAR2(255),
                Name VARCHAR2(255),
                Recreation VARCHAR2(255),
                PrisonNum NUMBER,
                PRIMARY KEY(AmenType, Name),
                FOREIGN KEY(PrisonNum) REFERENCES PrisonInfo ON DELETE CASCADE
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function initiateEmployeesTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE Employees CASCADE CONSTRAINTS`);
        } catch (err) {
            console.log('Employees table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE Employees (
                EmpID NUMBER NOT NULL,
                Name VARCHAR2(255)
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function initiateWorksAtTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE WorksAt CASCADE CONSTRAINTS`);
        } catch (err) {
            console.log('WorksAt table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE WorksAt (
                PrisonNum NUMBER,
                EmpID NUMBER,
                Salary NUMBER,
                PRIMARY KEY (PrisonNum, EmpID),
                FOREIGN KEY (PrisonNum) REFERENCES PrisonInfo ON DELETE CASCADE,
                FOREIGN KEY (EmpID) REFERENCES Employees ON DELETE CASCADE
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function initiateCertificationTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE Certification CASCADE CONSTRAINTS`);
        } catch (err) {
            console.log('Certification table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE Certification (
                Certificate VARCHAR2 PRIMARY KEY,
                Skills VARCHAR2(255),
                EmpID NUMBER,
                FOREIGN KEY (EmpID) REREFERENCES Employees ON DELETE CASCADE
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function initiateChefTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE CHEF CASCADE CONSTRAINTS`);
        } catch (err) {
            console.log('Chef table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE Chef (
                EmpID NUMBER PRIMARY KEY,
                MealToCook VARCHAR2(255),
                FOREIGN KEY (EmpID) REREFERENCES Employees ON DELETE CASCADE
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function initiateMaintenanceTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE Maintenance CASCADE CONSTRAINTS`);
        } catch (err) {
            console.log('Maintenance table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE Maintenance (
                EmpID NUMBER PRIMARY KEY,
                MaintenanceType VARCHAR2(255),
                FOREIGN KEY (EmpID) REREFERENCES Employees ON DELETE CASCADE
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function initiateGuardsTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE Guards CASCADE CONSTRAINTS`);
        } catch (err) {
            console.log('Guards table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE Guards (
                EmpID NUMBER PRIMARY KEY,
                GuardArea VARCHAR2(255),
                FOREIGN KEY (EmpID) REREFERENCES Employees ON DELETE CASCADE
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function initiateMedicalTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE Medical CASCADE CONSTRAINTS`);
        } catch (err) {
            console.log('Medical table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE Medical (
                EmpID NUMBER PRIMARY KEY,
                MedicalType VARCHAR2(255),
                FOREIGN KEY (EmpID) REREFERENCES Employees ON DELETE CASCADE
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

//initialize all tables from initialize.sql
async function initiateAllTables() {
    const tableInitFunctions = {
        initiateAmenititesTable,
        initiateCertificationTable,
        initiateChefTable,
        initiateClubTable,
        initiateEmployeesTable,
        initiateGuardsTable,
        initiateInmateTable,
        initiateMaintenanceTable,
        initiateMedicalTable,
        initiatePrisonInfoTable,
        initiatePrisonSecurityTable,
        initiateSentenceTable,
        initiateWorksAtTable,
    }
}

async function updateInmateCell(InmateID, newCell) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE Inmate SET holding_cell=:newCell WHERE InmateID=:InmateID`,
            [newCell, InmateID],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}
async function countInmates() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM Inmate');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}
async function fetchCellsFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM Cell');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function countCells() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM Cell');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

// ==================== INMATE FUNCTIONS ====================

async function getInmates() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'SELECT InmateID, HoldingCell, HealthNum, StartDate, EndDate FROM InmatesInfo',
            [], 
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    }).catch((err) => {
        console.error("Error fetching inmates:", err);
        return [];
    });
}

async function addInmate(inmateId, holdingCell, healthNum, startDate, endDate) {
    return await withOracleDB(async (connection) => {
        await connection.execute(
            `INSERT INTO InmatesInfo (InmateID, HoldingCell, HealthNum, StartDate, EndDate)
             VALUES (:1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD'), TO_DATE(:5, 'YYYY-MM-DD'))`,
            [inmateId, holdingCell, healthNum, startDate, endDate],
            { autoCommit: true }
        );
        return true;
    }).catch(() => {
        return false;
    });
}

async function initializeDatabase() {
    const sqlPath = path.join(__dirname, 'SQL/initialize.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    const statements = sqlScript
        .split(/;\s*[\r\n]+/) // Split on semicolon followed by newline
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

    return await withOracleDB(async (connection) => {
        for (let statement of statements) {
            try {
                await connection.execute(statement);
            } catch (err) {
                console.error('SQL error:', err.message, '\nStatement:', statement);
            }
        }
        await connection.commit();
        return true;
    });
}

async function insertDefaultData() {
    const sqlPath = path.join(__dirname, 'SQL/insertData.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    const statements = sqlScript
        .split(/;\s*[\r\n]+/)
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

    return await withOracleDB(async (connection) => {
        try {
            // Clear all tables in reverse order of dependency
            const clearStatements = [
                'DELETE FROM Medical',
                'DELETE FROM Maintenance',
                'DELETE FROM Chef',
                'DELETE FROM Guards',
                'DELETE FROM Certification',
                'DELETE FROM WorksAt',
                'DELETE FROM Employees',
                'DELETE FROM Amenities',
                'DELETE FROM Cells',
                'DELETE FROM Sentence',
                'DELETE FROM Club',
                'DELETE FROM MedicalData',
                'DELETE FROM InmatesInfo',
                'DELETE FROM InmatesCell',
                'DELETE FROM PrisonInfo',
                'DELETE FROM PrisonSecurity'
            ];

            for (const stmt of clearStatements) {
                await connection.execute(stmt);
            }

            for (let statement of statements) {
                try {
                    await connection.execute(statement);
                } catch (err) {
                    console.error('SQL error:', err.message, '\nStatement:', statement);
                }
            }

            await connection.commit();
            return true;
        } catch (err) {
            console.error("Error inserting default data:", err);
            return false;
        }
    });
}


async function getInmatesLeavingSoon() {
    return await withOracleDB(async (connection) => {
        const query = `
            SELECT InmateID, HoldingCell, HealthNum, StartDate, EndDate
            FROM InmatesInfo
            WHERE EndDate BETWEEN SYSDATE AND (SYSDATE + 30)
            ORDER BY EndDate
        `;
        const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return result.rows;
    });
}
// SQL QUERY FUNCTIONS ADDED

// ADD NEW INMATE with all detail
async function addCompleteInmate(inmateId, holdingCell, healthNum, startDate, endDate, 
                                 duration, crimeName, crimeType, severity,
                                 recordNum, bloodType, weight, sex, height) {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(
                `INSERT INTO InmatesInfo (InmateID, HoldingCell, HealthNum, StartDate, EndDate)
                 VALUES (:1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD'), TO_DATE(:5, 'YYYY-MM-DD'))`,
                [inmateId, holdingCell, healthNum, startDate, endDate],
                { autoCommit: false }
            );
            
            await connection.execute(
                `INSERT INTO Sentence (Duration, Name, Crime, Severity, InmateID)
                 VALUES (:1, :2, :3, :4, :5)`,
                [duration, crimeName, crimeType, severity, inmateId],
                { autoCommit: false }
            );
            
            await connection.execute(
                `INSERT INTO MedicalData (RecordNum, BloodType, Weight, Sex, Height, InmateID)
                 VALUES (:1, :2, :3, :4, :5, :6)`,
                [recordNum, bloodType, weight, sex, height, inmateId],
                { autoCommit: false }
            );
            
            await connection.commit();
            return true;
        } catch (err) {
            console.error("Error adding complete inmate record:", err);
            if (connection) {
                try {
                    await connection.rollback();
                } catch (rollbackErr) {
                    console.error("Rollback error:", rollbackErr);
                }
            }
            return false;
        }
    });
}

// DELETE Operation - Delete specific inmate
async function removeInmate(inmateID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM InmatesInfo WHERE InmateID = :InmateID`,
            [inmateID], 
            { autoCommit: true }
        );

        console.log(`Deleted rows: ${result.rowsAffected}`);

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((err) => {
        console.error("Database error while removing inmate:", err);
        return false;
    });
}

// UPDATE Operation - Transfer inmate to a different cell
async function transferInmate(inmateId, newHoldingCell) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE InmatesInfo
             SET HoldingCell = :newCell
             WHERE InmateID = :inmateId`,
            { newCell: newHoldingCell, inmateId: inmateId },  // Use named bind variables
            { autoCommit: true }
        );
        return result.rowsAffected > 0;
    }).catch((err) => {
        console.error("Error transferring inmate:", err);
        return false;
    });
}

// SELECTION - Get inmates by holding cell type
async function getInmatesByCell(cellType) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT *
             FROM InmatesInfo
             WHERE HoldingCell = :cellType`,
            [cellType],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    }).catch((err) => {
        console.error("Error getting inmates by cell:", err);
        return [];
    });
}

// PROJECTION - Get only basic inmate info without dates
async function getBasicInmateInfo() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT InmateID, HoldingCell, HealthNum
             FROM InmatesInfo
             ORDER BY InmateID`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    }).catch((err) => {
        console.error("Error getting basic inmate info:", err);
        return [];
    });
}

// JOIN - Get inmates with their medical data
async function getInmatesWithMedicalData() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT i.InmateID, i.HoldingCell, m.BloodType, m.Weight, m.Height, m.Sex
             FROM InmatesInfo i
             JOIN MedicalData m ON i.InmateID = m.InmateID
             ORDER BY i.InmateID`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    }).catch((err) => {
        console.error("Error getting inmates with medical data:", err);
        return [];
    });
}

// AGGREGATION WITH GROUP BY - Count inmates by cell type
async function countInmatesByCell() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT HoldingCell, COUNT(*) AS InmateCount
             FROM InmatesInfo
             GROUP BY HoldingCell`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    }).catch((err) => {
        console.error("Error counting inmates by cell:", err);
        return [];
    });
}



// AGGREGATION WITH HAVING - Find cells with more than N inmates
async function findCrowdedCells(minimumCount) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT HoldingCell, COUNT(*) AS InmateCount
             FROM InmatesInfo
             GROUP BY HoldingCell
             HAVING COUNT(*) >= :count
             ORDER BY InmateCount DESC`,
            [minimumCount],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    }).catch((err) => {
        console.error("Error finding crowded cells:", err);
        return [];
    });
}

// NESTED AGGREGATION - Find prisons with highest number of severe inmates
async function getPrisonsWithHighSeverityInmates() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT p.PrisonNum, COUNT(*) AS HighSeverityCount
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
             )`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    }).catch((err) => {
        console.error("Error finding prisons with high severity inmates:", err);
        return [];
    });
}

// DIVISION - Find inmates who have been in all types of holding cells
async function getInmatesInAllCells() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT i.InmateID
             FROM InmatesInfo i
             WHERE NOT EXISTS (
                 SELECT hc.HoldingCell
                 FROM (SELECT DISTINCT HoldingCell FROM InmatesInfo) hc
                 WHERE NOT EXISTS (
                     SELECT 1
                     FROM InmatesInfo ii
                     WHERE ii.InmateID = i.InmateID
                     AND ii.HoldingCell = hc.HoldingCell
                 )
             )`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    }).catch((err) => {
        console.error("Error finding inmates in all holding cells:", err);
        return [];
    });
}

async function reduceSentenceForGoodBehaviour(inmateId, monthsReduced) {
    return await withOracleDB(async (connection) => {
        const query = `
            UPDATE Sentence
            SET Duration = Duration - :months
            WHERE InmateID = :inmateId
        `;
        const result = await connection.execute(query, {
            months: monthsReduced,
            inmateId: inmateId
        }, { autoCommit: true });

        return result.rowsAffected > 0;
    });
}

async function getEmployeesAtAllHighSecurityPrisons() {
    return await withOracleDB(async (connection) => {
        const query = `
            SELECT E.EmpID, E.Name, W.PrisonNum, PS.SecurityLevel
            FROM Employees E
            JOIN WorksAt W ON E.EmpID = W.EmpID
            JOIN PrisonInfo PI ON W.PrisonNum = PI.PrisonNum
            JOIN PrisonSecurity PS ON PI.SecurityLevel = PS.SecurityLevel
            WHERE PS.SecurityLevel >= 8
        `;
        const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return result.rows;
    });
}

async function getMedicalRecords() {
    return await withOracleDB(async (conn) => {
        const result = await conn.execute(`SELECT * FROM MedicalData`, [], {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });
        return result.rows;
    });
}

async function addMedicalRecord(recordNum, bloodType, weight, sex, height, inmateId) {
    return await withOracleDB(async (conn) => {
        try {
            await conn.execute(`
                INSERT INTO MedicalData (RecordNum, BloodType, Weight, Sex, Height, InmateID)
                VALUES (:1, :2, :3, :4, :5, :6)
            `, [recordNum, bloodType, weight, sex, height, inmateId], { autoCommit: true });
            return true;
        } catch (err) {
            console.error("Error adding medical record:", err);
            return false;
        }
    });
}

async function getInmatesWithMedicalAndSentence() {
    return await withOracleDB(async (conn) => {
        const result = await conn.execute(`
            SELECT i.InmateID, i.HoldingCell, m.BloodType, m.Weight, m.Height, s.Crime, s.Duration
            FROM InmatesInfo i
            JOIN MedicalData m ON i.InmateID = m.InmateID
            JOIN Sentence s ON i.InmateID = s.InmateID
            ORDER BY s.Duration DESC
        `, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return result.rows;
    });
}



module.exports = {
    testOracleConnection,
    fetchInmatesFromDb,
    initiateAllTables,
    updateInmateCell,
    countInmates,
    fetchCellsFromDb,
    insertDefaultData,
    countCells,
    getInmates,
    addInmate,
    initializeDatabase,
    getInmatesLeavingSoon,
    addCompleteInmate,
    removeInmate,
    transferInmate,
    reduceSentenceForGoodBehaviour,
    getInmatesByCell,
    getBasicInmateInfo,
    getInmatesWithMedicalData,
    countInmatesByCell,
    findCrowdedCells,
    getPrisonsWithHighSeverityInmates,
    getEmployeesAtAllHighSecurityPrisons,
    getMedicalRecords,
    addMedicalRecord,
    getInmatesWithMedicalAndSentence
};