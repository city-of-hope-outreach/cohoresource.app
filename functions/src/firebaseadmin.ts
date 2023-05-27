import admin from 'firebase-admin';
import {getAuth} from 'firebase-admin/auth';
import {getDatabase} from 'firebase-admin/database';
const app = admin.initializeApp();

export const db = getDatabase(app);

export const auth = getAuth(app);
