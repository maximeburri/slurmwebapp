{
  "predefinedSubmissions": [
    {
      "name": "OpenMPI",
      "hide": true,
      "job": {
        "timeLimit": {
          "days": 1,
          "hours": 12,
          "minutes": 0,
          "seconds": 0
        }
      }
    },
    {
      "name": "OpenMPI GCC/1100",
      "group": "MPI",
      "job": {
        "modules": {
          "module": "openmpi/gcc/1100"
        },
        "licenses": []
      },
      "parent": "OpenMPI"
    },
    {
      "name": "OpenMPI GCC/1102",
      "group": "MPI",
      "job": {
        "modules": {
          "module": "openmpi/gcc/1102"
        }
      },
      "parent": "OpenMPI"
    },
    {
      "name": "Matlab",
      "job": {
        "modules": {
          "module": "matlab/2013b"
        },
        "licenses": [
          "matlab@matlablm.unige.ch"
        ],
        "execution": {
          "executable": "matlab",
          "arguments": "yourScript"
        }
      }
    },
    {
      "name": "Big memory",
      "job": {
        "memory": {
          "value": 64,
          "unit": "GB",
          "default": false
        },
        "partition": "bigmem",
        "licenses": [
          "matlab@matlablm.unige.ch"
        ]
      }
    },
    {
      "name": "R",
      "job": {
        "partition": "mono",
        "modules": {
          "module": "R/3.2.3"
        },
        "licenses": [],
        "execution": {
          "executable": "R",
          "arguments": "yourScript"
        }
      }
    }
  ]
}
