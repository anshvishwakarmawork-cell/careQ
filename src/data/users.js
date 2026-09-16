export const users = [
  {
    id: "U1",
    email: "patient@demo.com",
    password: "demo",
    role: "PATIENT",
    patientId: "P3", // Linked to "Ansh"
    name: "Ansh"
  },
  {
    id: "U2",
    email: "doctor@demo.com",
    password: "demo",
    role: "DOCTOR",
    doctorId: "DOC1", // Linked to Dr. Ankit Sharma
    name: "Dr. Ankit Sharma"
  },
  {
    id: "staff-101",
    email: "reception.citycare@carequeue.demo",
    password: "demo",
    role: "RECEPTION",
    hospitalId: "H1", // City Care Hospital
    name: "Priya Sharma",
    employeeId: "CC-REC-101",
    status: "ACTIVE"
  },
  {
    id: "staff-102",
    email: "reception2.citycare@carequeue.demo",
    password: "demo",
    role: "RECEPTION",
    hospitalId: "H1", // City Care Hospital
    name: "Aman Verma",
    employeeId: "CC-REC-102",
    status: "ACTIVE"
  },
  {
    id: "staff-201",
    email: "reception.apollo@carequeue.demo",
    password: "demo",
    role: "RECEPTION",
    hospitalId: "H2", // Apollo Care Hospital
    name: "Rajesh Kumar",
    employeeId: "AC-REC-201",
    status: "ACTIVE"
  },
  {
    id: "staff-301",
    email: "reception.medicare@carequeue.demo",
    password: "demo",
    role: "RECEPTION",
    hospitalId: "H3", // Medicare Clinic
    name: "Sneha Patel",
    employeeId: "MC-REC-301",
    status: "ACTIVE"
  },
  {
    id: "staff-inactive",
    email: "inactive.reception@carequeue.demo",
    password: "demo",
    role: "RECEPTION",
    hospitalId: "H1",
    name: "Disabled Account",
    employeeId: "CC-REC-999",
    status: "INACTIVE"
  }
];
