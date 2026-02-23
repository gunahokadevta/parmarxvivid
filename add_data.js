const fs = require('fs');
const readline = require('readline-sync');

function loadDB() { return JSON.parse(fs.readFileSync('db.json', 'utf8')); }
function saveDB(db) { fs.writeFileSync('db.json', JSON.stringify(db, null, 2)); }

function main() {
    let db = loadDB();
    const options = ['Add/Update Content', 'Manage/Delete Data'];
    const index = readline.keyInSelect(options, 'What do you want to do?');
    if (index === 0) addNewOrUpdate(db);
    else if (index === 1) manageData(db);
}

function addNewOrUpdate(db) {
    let courseNames = db.courses.map(c => c.name);
    courseNames.push("ADD ANOTHER COURSE (+)");
    let cIndex = readline.keyInSelect(courseNames, 'Select Course:');
    if (cIndex === -1) return;

    if (cIndex === courseNames.length - 1) {
        let newCourseName = readline.question('Enter New Course Name: ').toUpperCase();
        let teacherName = readline.question('Enter Teacher Name: ').toUpperCase();
        
        // --- YAHAN FIX KIYA HAI ---
        const modeOptions = ['Regular Course (with Subjects/Chapters)', 'Direct Link (Redirect to URL)'];
        let modeIndex = readline.keyInSelect(modeOptions, 'Select Mode for ' + newCourseName + ':');
        
        if (modeIndex === 1) {
            let directLink = readline.question('Enter Direct Redirect Link: ');
            db.courses.push({ name: newCourseName, teacher: teacherName, directLink: directLink, subjects: [] });
            saveDB(db);
            console.log('✅ Redirect Course Added!');
            return;
        } else {
            db.courses.push({ name: newCourseName, teacher: teacherName, subjects: [] });
            saveDB(db);
            console.log('✅ Regular Course Added!');
            return;
        }
    }

    let course = db.courses[cIndex];
    let subjectNames = course.subjects.map(s => s.name);
    subjectNames.push("ADD NEW SUBJECT (+)");
    let sIndex = readline.keyInSelect(subjectNames, 'Select Subject:');
    if (sIndex === -1) return;

    if (sIndex === subjectNames.length - 1) {
        let newSubName = readline.question('Enter New Subject Name: ').toUpperCase();
        course.subjects.push({ name: newSubName, CHAPTERS: [], "WEEKLY TESTS": [] });
        saveDB(db);
        console.log('✅ Subject added!');
        return;
    }

    let sub = course.subjects[sIndex];
    const types = ['CHAPTERS', 'WEEKLY TESTS'];
    let tIndex = readline.keyInSelect(types, 'Select Category:');
    if (tIndex === -1) return;
    let cat = types[tIndex];

    let list = sub[cat].map(item => item.title);
    list.push("ADD NEW " + cat);
    let itemIndex = readline.keyInSelect(list, 'Select Item:');
    if (itemIndex === -1) return;

    let title, existing = null;
    if (itemIndex === list.length - 1) title = readline.question('Enter Title: ');
    else { existing = sub[cat][itemIndex]; title = existing.title; }

    console.log("\n[LECTURE LINK / HTML CODE]");
    console.log("Paste code, press ENTER, type 'DONE' and press ENTER.");
    let lines = [];
    while (true) {
        let line = readline.question('>');
        if (line.trim().toUpperCase() === 'DONE') break;
        lines.push(line);
    }
    let link = lines.join(" ").replace(/(\r\n|\n|\r)/gm, " ").trim();
    if (!link && existing) link = existing.url;

    let dLink = existing ? existing.download_url : null;
    if (link && link.includes('<')) {
        dLink = readline.question('Lecture Download Link: ');
    }

    let nEn = readline.question('Eng Notes: ', {defaultInput: existing ? existing.notes_en : ''});
    let nHi = readline.question('Hindi Notes: ', {defaultInput: existing ? existing.notes_hi : ''});
    let quiz = readline.question('Quiz: ', {defaultInput: existing ? existing.quiz : ''});
    let ppt = readline.question('PPT/Other: ', {defaultInput: existing ? existing.handwritten : ''});

    let newData = { title, url: link || null, download_url: dLink || null, notes_en: nEn || null, notes_hi: nHi || null, quiz: quiz || null, handwritten: ppt || null };
    if (existing) sub[cat][itemIndex] = newData; else sub[cat].push(newData);
    saveDB(db);
    console.log('\n✅ Saved Successfully!');
}

function manageData(db) {
    let cIndex = readline.keyInSelect(db.courses.map(c => c.name), 'Select Course:');
    if (cIndex === -1) return;

    if (readline.keyInYN('Delete FULL Course "' + db.courses[cIndex].name + '"? (Confirm 1/2)')) {
        if (readline.keyInYN('WARNING: Final Confirmation. Confirm? (Confirm 2/2)')) {
            db.courses.splice(cIndex, 1);
            saveDB(db);
            console.log('🗑️ Course Deleted!');
            return;
        }
    }

    if (db.courses[cIndex].subjects.length === 0) return;

    let sIndex = readline.keyInSelect(db.courses[cIndex].subjects.map(s => s.name), 'Select Subject:');
    if (sIndex === -1) return;

    let sub = db.courses[cIndex].subjects[sIndex];
    if (readline.keyInYN('Delete Subject "' + sub.name + '"? (Confirm 1/2)')) {
        if (readline.keyInYN('Confirm Deletion? (Confirm 2/2)')) {
            db.courses[cIndex].subjects.splice(sIndex, 1);
            saveDB(db);
            console.log('🗑️ Subject Deleted!');
            return;
        }
    }

    let catIndex = readline.keyInSelect(['CHAPTERS', 'WEEKLY TESTS'], 'Select Category:');
    if (catIndex === -1) return;
    let cat = catIndex === 0 ? 'CHAPTERS' : 'WEEKLY TESTS';

    let itemIndex = readline.keyInSelect(sub[cat].map(i => i.title), 'Delete item?');
    if (itemIndex !== -1) {
        if (readline.keyInYN('Confirm 1/2?')) {
            if (readline.keyInYN('Final Confirm 2/2?')) {
                sub[cat].splice(itemIndex, 1);
                saveDB(db);
                console.log('🗑️ Item Deleted!');
            }
        }
    }
}
main();
