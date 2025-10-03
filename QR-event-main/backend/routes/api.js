import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

const router = express.Router();

// In-memory storage
const students = new Map();
const scannedEntries = new Map();
const statusLog = [];

// Initialize sample data
const initializeSampleData = () => {
  const sampleStudents = [
    { studentId: 'STU001', name: 'John Doe', email: 'john@college.edu' },
    { studentId: 'STU002', name: 'Jane Smith', email: 'jane@college.edu' },
    { studentId: 'STU003', name: 'Mike Johnson', email: 'mike@college.edu' },
    { studentId: 'STU004', name: 'Sarah Wilson', email: 'sarah@college.edu' },
    { studentId: 'STU005', name: 'Alex Brown', email: 'alex@college.edu' },
    { studentId: 'STU006', name: 'Emily Davis', email: 'emily@college.edu' },
    { studentId: 'STU007', name: 'David Miller', email: 'david@college.edu' },
    { studentId: 'STU008', name: 'Lisa Taylor', email: 'lisa@college.edu' }
  ];

  sampleStudents.forEach(student => {
    students.set(student.studentId, {
      ...student,
      scanned: false,
      scannedAt: null,
      passGenerated: false,
      passId: null
    });
  });

  console.log('✅ Sample data initialized with 8 students');
};

initializeSampleData();

// Generate QR Code for student
router.post('/student/:studentId/generate-pass', async (req, res) => {
  const { studentId } = req.params;
  const student = students.get(studentId);

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  try {
    const passId = uuidv4();
    const qrData = JSON.stringify({
      studentId: student.studentId,
      passId: passId,
      eventId: 'TECHFEST2024',
      timestamp: Date.now()
    });

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData);

    // Update student record
    student.passGenerated = true;
    student.passId = passId;
    student.qrData = qrData;
    student.generatedAt = new Date().toISOString();

    // Add to status log
    statusLog.unshift({
      id: uuidv4(),
      studentId,
      name: student.name,
      status: 'generated',
      timestamp: new Date().toISOString(),
      message: `${student.name} generated event pass`
    });

    // Keep only last 50 logs
    if (statusLog.length > 50) statusLog.pop();

    res.json({
      success: true,
      student: {
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        passId: passId,
        qrCodeDataURL: qrCodeDataURL,
        qrData: qrData,
        generatedAt: student.generatedAt,
        scanned: student.scanned
      }
    });

  } catch (error) {
    console.error('QR Generation error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Scan QR code
router.post('/scan', async (req, res) => {
  const { qrData } = req.body;

  try {
    const parsedData = JSON.parse(qrData);
    const { studentId, passId, eventId } = parsedData;

    const student = students.get(studentId);

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid QR code: Student not found' 
      });
    }

    if (!student.passGenerated || student.passId !== passId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid QR code: Pass not generated or expired' 
      });
    }

    if (student.scanned) {
      // Add to status log
      statusLog.unshift({
        id: uuidv4(),
        studentId,
        name: student.name,
        status: 'duplicate',
        timestamp: new Date().toISOString(),
        message: `Duplicate scan attempt for ${student.name}`
      });

      return res.json({ 
        success: false, 
        message: 'QR code already used - Entry already provided',
        student: {
          name: student.name,
          studentId: student.studentId,
          scanned: true,
          scannedAt: student.scannedAt
        }
      });
    }

    // Mark as scanned
    student.scanned = true;
    student.scannedAt = new Date().toISOString();

    // Add to scanned entries
    const scanId = uuidv4();
    scannedEntries.set(scanId, {
      studentId,
      passId,
      eventId,
      scannedAt: student.scannedAt
    });

    // Add to status log
    statusLog.unshift({
      id: uuidv4(),
      studentId,
      name: student.name,
      status: 'success',
      timestamp: student.scannedAt,
      message: `Entry provided for ${student.name}`
    });

    res.json({
      success: true,
      message: 'Entry provided successfully!',
      student: {
        name: student.name,
        studentId: student.studentId,
        email: student.email,
        scanned: true,
        scannedAt: student.scannedAt
      }
    });

  } catch (error) {
    console.error('Scan error:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Invalid QR code format' 
    });
  }
});

// Get student data
router.get('/student/:studentId', (req, res) => {
  const { studentId } = req.params;
  const student = students.get(studentId);

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  res.json({
    studentId: student.studentId,
    name: student.name,
    email: student.email,
    scanned: student.scanned,
    scannedAt: student.scannedAt,
    passGenerated: student.passGenerated,
    passId: student.passId,
    generatedAt: student.generatedAt
  });
});

// Get all students (for demo)
router.get('/students', (req, res) => {
  const studentsArray = Array.from(students.values()).map(student => ({
    studentId: student.studentId,
    name: student.name,
    email: student.email,
    scanned: student.scanned,
    scannedAt: student.scannedAt,
    passGenerated: student.passGenerated
  }));
  
  res.json({ students: studentsArray });
});

// Get status log
router.get('/status-log', (req, res) => {
  const logs = statusLog.slice(0, 20); // Last 20 entries
  res.json({ logs });
});

// Get statistics
router.get('/stats', (req, res) => {
  const totalStudents = students.size;
  const scannedCount = Array.from(students.values()).filter(s => s.scanned).length;
  const passesGenerated = Array.from(students.values()).filter(s => s.passGenerated).length;
  
  res.json({
    totalStudents,
    scannedCount,
    remaining: totalStudents - scannedCount,
    passesGenerated
  });
});

// Refresh student status
router.post('/student/:studentId/refresh', (req, res) => {
  const { studentId } = req.params;
  const student = students.get(studentId);

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  res.json({
    studentId: student.studentId,
    scanned: student.scanned,
    scannedAt: student.scannedAt,
    passGenerated: student.passGenerated
  });
});

// Reset all data (for testing)
router.post('/reset-data', (req, res) => {
  students.clear();
  scannedEntries.clear();
  statusLog.length = 0;
  initializeSampleData();
  
  res.json({ success: true, message: 'Data reset successfully' });
});

export default router;