import bcrypt from 'bcrypt';
import db from './db.js';



const updatePasswords = async () => {
  db.query('SELECT * FROM users', async (err, results) => {
    if (err) {
      console.error(err);
      return;
    }

    // Iterate over each user in the database
    for (const user of results) {
      try {
        // Hash the user's current password
        const hashedPassword = await bcrypt.hash(user.password, 10); // 10 is the salt rounds

        // Update the user's password with the hashed version
        db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id], (updateErr) => {
          if (updateErr) {
            console.error(`Error updating user ${user.id}:`, updateErr);
          } else {
            console.log(`User ${user.id} password updated successfully`);
          }
        });
      } catch (error) {
        console.error(`Error hashing password for user ${user.id}:`, error);
      }
    }
  });
};

// Run the update function
updatePasswords();
