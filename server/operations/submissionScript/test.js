var SubmissionScript = require('./functions.js');

var script2 = "#!/bin/sh\n\
module load module1 module2 module3\n\
\n\
srun patati arg1 arg2";

var script2 = "#!/bin/sh \n\
#SBATCH asd\n\
srun patati\n\
";

var script = "#!/bin/sh";

var script5 = "#!/bin/sh \n\
# des lignes \n\
#SBATCH -J monJob\n\
# des lignes \n\
srun patati\n\
# des lignes \n\
";

var script = "#!/bin/sh\n\
#SBATCH --job-name pululagua \n\
#SBATCH -n 128 \n\
#SBATCH -c 1 \n\
#SBATCH -p cui \n\
#SBATCH -t 02:00:00 \n\
#SBATCH -o pululagua.o%j \n\
\n\
srun matlab arg1 arg2 arg3";

var scriptsToJob = [
    {
        script:
        "#!/bin/sh\n\
\n\
#SBATCH -J pululagua\n\
#SBATCH -n 128\n\
#SBATCH -c 1\n\
#SBATCH -p cui\n\
#SBATCH -t 02:00:00\n\
#SBATCH -o pululagua.o%j\n\
\n\
echo $SLURM_NODELIST\n\
\n\
module load GCC/4.7.2\n\
\n\
echo 'Module loaded'\n\
cp file file.old\n\
\n\
srun ~/GIT/TTM/tetras/tetras -x 30000 -y 30000 -z 30000 \n",

        job:
            { jobName: 'pululagua',
              nbTasks: 128,
              nbCPUsPerTasks: 1,
              partition: 'cui',
              timeLimit: { days: 0, hours: 2, minutes: 0, seconds: 0 },
              execution: { executable: 'matlab', arguments: 'arg1 arg2 arg3' }
            }
    }
];

console.log("=============== Loading of =================")
console.log(scriptsToJob[0].script);
console.log("=============== Result =====================");
jobLoaded = SubmissionScript.load(scriptsToJob[0].script);
console.log(jobLoaded);

console.log("\n\n");

console.log("=============== Saving of =================")
console.log(scriptsToJob[0].job);
console.log("=============== Result =====================");
scriptToSave = SubmissionScript.save(scriptsToJob[0].job, scriptsToJob[0].script);
console.log(scriptToSave);

console.log("=============== New of =================")
console.log(scriptsToJob[0].job);
console.log("=============== Result =====================");
scriptToSave = SubmissionScript.save(scriptsToJob[0].job);
console.log(scriptToSave);
