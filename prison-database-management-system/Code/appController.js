/* Prison DBMS appController.js*/
const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/demotable', async (req, res) => {
    const tableContent = await appService.fetchDemotableFromDb();
    res.json({data: tableContent});
});


router.post("/insert-demotable", async (req, res) => {
    const { id, name } = req.body;
    const insertResult = await appService.insertDemotable(id, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-name-demotable", async (req, res) => {
    const { oldName, newName } = req.body;
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
    if (tableCount >= 0) {
        res.json({ 
            success: true,  
            count: tableCount
        });
    } else {
        res.status(500).json({ 
            success: false, 
            count: tableCount
        });
    }
});

// ---------- INMATES ROUTES ----------
// Initialize database
router.post('/init-db', async (req, res) => {
    try {
        const result = await appService.initializeDatabase();
        res.json({ success: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

router.post('/insert-data', async (req, res) => {
    try {
        const result = await appService.insertDefaultData();
        res.json({ success: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});



// Get all inmates
router.get('/inmates', async (req, res) => {
    try {
        const data = await appService.getInmates();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch inmates' });
    }
});

// Add basic inmate
router.post('/add-inmate', async (req, res) => {
    const { inmateId, holdingCell, healthNum, startDate, endDate } = req.body;
    try {
        const result = await appService.addInmate(inmateId, holdingCell, healthNum, startDate, endDate);
        res.json({ success: result });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to add inmate' });
    }
});

// Route to fetch all inmates
router.get('/inmates', async (req, res) => {
    try {
        const data = await appService.getInmates();
        res.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching inmates:", error);
        res.status(500).json({ success: false, message: "Failed to load inmates" });
    }
});


// DELETE operation route - Remove inmate
router.post("/remove-inmate", async (req, res) => {
    try {
        const { inmateID } = req.body;

        if (!inmateID) {
            return res.status(400).json({ success: false, message: "Inmate ID is required" });
        }

        const success = await appService.removeInmate(inmateID);

        if (success) {
            res.json({ success: true, message: "Inmate removed successfully" });
        } else {
            res.status(400).json({ success: false, message: "Inmate not found or could not be removed" });
        }
    } catch (error) {
        console.error("Error removing inmate:", error);
        res.status(500).json({ success: false, message: "Failed to remove inmate" });
    }
});

// Add complete inmate with all related data
router.post('/add-complete-inmate', async (req, res) => {
    const { 
        inmateId, holdingCell, healthNum, startDate, endDate, 
        duration, crimeName, crimeType, severity,
        recordNum, bloodType, weight, sex, height 
    } = req.body;
    
    try {
        const result = await appService.addCompleteInmate(
            inmateId, holdingCell, healthNum, startDate, endDate, 
            duration, crimeName, crimeType, severity,
            recordNum, bloodType, weight, sex, height
        );
        res.json({ 
            success: result,
            message: result ? 'Complete inmate record added successfully' : 'Failed to add complete inmate record'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to add complete inmate record' });
    }
});

// Get inmates leaving in the next 30 days
router.get('/inmates-leaving-soon', async (req, res) => {
    try {
        const data = await appService.getInmatesLeavingSoon();
        res.json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch upcoming releases' });
    }
});

// DELETE operation route - Remove inmates
router.post('/remove-inmate', async (req, res) => {
    try {
        const { inmateID } = req.body;
        
        if (!inmateID) {
            return res.status(400).json({ success: false, message: "Inmate ID is required" });
        }
        
        const success = await appService.removeInmate(inmateID);
        
        if (success) {
            res.json({ success: true, message: "Inmate removed successfully" });
        } else {
            res.status(400).json({ success: false, message: "Inmate not found or could not be removed" });
        }
    } catch (error) {
        console.error("Error removing inmate:", error);
        res.status(500).json({ success: false, message: "Failed to remove inmate" });
    }
});

// UPDATE operation transfer inmate to a different cell
router.post('/transfer-inmate', async (req, res) => {
    const { inmateId, newHoldingCell } = req.body;

    if (!inmateId || !newHoldingCell) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    try {
        const result = await appService.transferInmate(inmateId, newHoldingCell);
        res.json({ 
            success: result,
            message: result ? 
                `Inmate ${inmateId} transferred to ${newHoldingCell}` : 
                `Failed to transfer inmate ${inmateId}` 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// SELECTION operation - Get inmates by cell type
router.get('/inmates-by-cell/:cellType', async (req, res) => {
    try {
        const cellType = req.params.cellType;
        const data = await appService.getInmatesByCell(cellType);
        res.json({ 
            success: true, 
            data,
            count: data.length 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch inmates by cell type' });
    }
});

// PROJECTION operation - Get basic inmate info
router.get('/basic-inmate-info', async (req, res) => {
    try {
        const data = await appService.getBasicInmateInfo();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch basic inmate info' });
    }
});

// JOIN operation - Get inmates with medical data
router.get('/inmates-with-medical', async (req, res) => {
    try {
        const data = await appService.getInmatesWithMedicalData();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch inmates with medical data' });
    }
});

// AGGREGATION operation - Count inmates by cell
router.get("/inmates-count-by-cell", async (req, res) => {
    try {
        const data = await appService.countInmatesByCell();
        res.json({ success: true, data });
    } catch (err) {
        console.error("Error retrieving inmate count:", err);
        res.status(500).json({ success: false, message: "Failed to count inmates by cell" });
    }
});

// AGGREGATION with HAVING - Find crowded cells
router.get('/crowded-cells/:minimumCount', async (req, res) => {
    try {
        const minimumCount = parseInt(req.params.minimumCount) || 2;
        const data = await appService.findCrowdedCells(minimumCount);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to find crowded cells' });
    }
});

// NESTED AGGREGATION - High severity prisons
router.get('/high-severity-prisons', async (req, res) => {
    try {
        const data = await appService.getPrisonsWithHighSeverityInmates();
        res.json({ success: true, data });
    } catch (err) {
        console.error("Error in /high-severity-prisons:", err);
        res.status(500).json({ success: false, message: "Failed to fetch high severity prisons" });
    }
});


// DIVISION - Find inmates who have been in all types of holding cells
router.get('/inmates-all-cells', async (req, res) => {
    try {
        const data = await appService.getInmatesInAllCells();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to find inmates in all cell types" });
    }
});

router.get('/medical-data', async (req, res) => {
    try {
      const data = await appService.getInmatesWithMedicalData();
      res.json({ success: true, data });
    } catch (err) {
      console.error('Error fetching medical data:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  
// GET all medical records
router.get('/medical-records', async (req, res) => {
    const data = await appService.getMedicalRecords();
    res.json({ success: true, data });
});

// POST add medical record
router.post('/add-medical', async (req, res) => {
    const { recordNum, bloodType, weight, sex, height, inmateId } = req.body;
    const success = await appService.addMedicalRecord(recordNum, bloodType, weight, sex, height, inmateId);
    res.json({ success, message: success ? 'Record added!' : 'Failed to add record' });
});

// GET joined medical + sentence + inmate info
router.get('/medical-joined', async (req, res) => {
    const data = await appService.getInmatesWithMedicalAndSentence();
    res.json({ success: true, data });
});


module.exports = router;