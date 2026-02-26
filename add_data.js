const fs = require('fs');
const readline = require('readline-sync');

function loadDB() {
    if (!fs.existsSync('db.json')) fs.writeFileSync('db.json', JSON.stringify({ courses: [], notifications: [] }));
    let data = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    if (!data.notifications) data.notifications = [];
    return data;
}
function saveDB(db) { fs.writeFileSync('db.json', JSON.stringify(db, null, 2)); }

function main() {
    let db = loadDB();
    console.log('\n--- VIVID ACADEMY DASHBOARD PANEL ---');
    const mainOpts = ['ADD NOTIFICATION (📢)', 'ADD/UPDATE COURSE CONTENT', 'DELETE DATA/NOTIF', 'EXIT'];
    const index = readline.keyInSelect(mainOpts, 'What do you want to do?');

    if (index === 0) {
        // NOTIFICATION LOGIC
        let msg = readline.question('\nEnter Notification Message: ');
        let tag = readline.question('Tag (NEW/UPDATE/ALERT): ').toUpperCase() || "UPDATE";
        let date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        db.notifications.push({ tag, message: msg, date });
        saveDB(db);
        console.log('✅ Notification Published!');
    } else if (index === 1) {
        addNewOrUpdate(db);
    } else if (index === 2) {
        manageData(db);
    } else {
        process.exit();
    }
}

function addNewOrUpdate(db) {
    let courseNames = [...db.courses.map(c => c.name), "ADD ANOTHER COURSE (+)"];
    let choice = readline.keyInSelect(courseNames, 'Select Course:');
    if (choice === -1) return;

    if (choice === courseNames.length - 1) {
        let name = readline.question('New Course Name: ').toUpperCase();
        let teacher = readline.question('Teacher Name: ').toUpperCase();
        db.courses.push({ name, teacher, subjects: [] });
        saveDB(db);
        console.log('✅ Course Added!');
    } else {
        let course = db.courses[choice];
        let subNames = [...course.subjects.map(s => s.name), "ADD NEW SUBJECT (+)"];
        let sIdx = readline.keyInSelect(subNames, 'Select Subject:');
        if (sIdx === -1) return;

        if (sIdx === subNames.length - 1) {
            let sName = readline.question('Subject Name: ').toUpperCase();
            course.subjects.push({ name: sName, CHAPTERS: [], "WEEKLY TESTS": [] });
            saveDB(db);
        } else {
            let sub = course.subjects[sIdx];
            let cat = ['CHAPTERS', 'WEEKLY TESTS'][readline.keyInSelect(['CHAPTERS', 'WEEKLY TESTS'], 'Category:')];
            if (!cat) return;
            let items = [...sub[cat].map(i => i.title), "ADD NEW CONTENT (+)"];
            let iIdx = readline.keyInSelect(items, 'Select Content:');
            if (iIdx === -1) return;

            let title, existing = null;
            if (iIdx === items.length - 1) title = readline.question('Title: ');
            else { existing = sub[cat][iIdx]; title = existing.title; }

            console.log("\n[PASTE LINK/HTML - TYPE 'DONE']");
            let lines = [];
            while (true) {
                let line = readline.question('>');
                if (line.trim().toUpperCase() === 'DONE') break;
                lines.push(line);
            }
            let link = lines.join(" ").trim();
            if (!link && existing) link = existing.url;

            let dLink = (link && link.includes('<')) ? readline.question('Download Link: ') : (existing ? existing.download_url : null);
            let nEn = readline.question('Eng Notes: ', {defaultInput: existing ? existing.notes_en : ''});
            let nHi = readline.question('Hindi Notes: ', {defaultInput: existing ? existing.notes_hi : ''});
            let quiz = readline.question('Quiz: ', {defaultInput: existing ? existing.quiz : ''});
            let ppt = readline.question('PPT/Other: ', {defaultInput: existing ? existing.handwritten : ''});

            let newData = { title, url: link || null, download_url: dLink || null, notes_en: nEn || null, notes_hi: nHi || null, quiz: quiz || null, handwritten: ppt || null };
            if (existing) sub[cat][iIdx] = newData; else sub[cat].push(newData);
            saveDB(db);
            console.log('✅ Content Saved!');
        }
    }
    main();
}

function manageData(db) {
    const opts = ['Manage Courses', 'Manage Notifications'];
    let idx = readline.keyInSelect(opts, 'Delete what?');
    if (idx === 1) {
        let nIdx = readline.keyInSelect(db.notifications.map(n => n.message.slice(0, 20)), 'Delete Notification?');
        if (nIdx !== -1) { db.notifications.splice(nIdx, 1); saveDB(db); console.log('🗑️ Deleted!'); }
    } else if (idx === 0) {
        let cIdx = readline.keyInSelect(db.courses.map(c => c.name), 'Delete Course?');
        if (cIdx !== -1) { db.courses.splice(cIdx, 1); saveDB(db); console.log('🗑️ Deleted!'); }
    }
    main();
}

main();
