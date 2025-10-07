import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';
import { Project } from '../src/models/Project.js';
import { Role } from '../src/models/enums.js';
import { connectDB } from '../src/db.js';
async function run() {
    await connectDB();
    const adminEmail = 'admin@demo.com';
    const memberEmail = 'member@demo.com';
    const adminPass = await bcrypt.hash('Admin@123', 10);
    const memberPass = await bcrypt.hash('Member@123', 10);
    const [admin] = await User.findOneAndUpdate({ email: adminEmail }, { email: adminEmail, password: adminPass, role: Role.ADMIN }, { upsert: true, new: true, setDefaultsOnInsert: true }).then((doc) => [doc]);
    const [member] = await User.findOneAndUpdate({ email: memberEmail }, { email: memberEmail, password: memberPass, role: Role.MEMBER }, { upsert: true, new: true, setDefaultsOnInsert: true }).then((doc) => [doc]);
    // Seed sample projects if fewer than 6 exist
    const count = await Project.countDocuments();
    if (count < 6) {
        const samples = [
            { title: 'Website Redesign', client: 'Acme Corp', budget: 12000, status: 'LEAD', ownerId: admin._id },
            { title: 'Mobile App', client: 'Globex', budget: 45000, status: 'IN_PROGRESS', ownerId: admin._id },
            { title: 'CRM Migration', client: 'Initech', budget: 18000, status: 'ON_HOLD', ownerId: member._id },
            { title: 'SEO Campaign', client: 'Umbrella', budget: 8000, status: 'DONE', ownerId: member._id },
            { title: 'Data Pipeline', client: 'Soylent', budget: 35000, status: 'LEAD', ownerId: admin._id },
            { title: 'Support Retainer', client: 'Stark Industries', budget: 6000, status: 'IN_PROGRESS', ownerId: member._id }
        ];
        await Project.insertMany(samples);
    }
    console.log('Seed completed');
    await mongoose.disconnect();
}
run().catch((e) => {
    console.error(e);
    process.exit(1);
});
