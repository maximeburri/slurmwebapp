{
  "rules": {
    "full_node": {
      "rule": "job.nbCPUsPerTasks*job.nbTasks < parameters.CPUsPerNode",
      "reason": "La partition alloue tout le noeud et pour un job utilisant plus de CPUs",
      "parameters": {
        "CPUsPerNode": 16
      }
    },
    "min_memory": {
        "rule": "job.memory.bytesValue < tools.toBytes(parameters.minMemory, parameters.minMemoryUnit)",
        "reason": "La partition est pour des jobs allouant beaucoup de mémoire",
        "parameters" : {
          "minMemory" : 64,
          "minMemoryUnit" : "GB"
        }
    },
    "in_groups":{
        "rule": "tools.isUserInGroups(parameters.groups)",
        "reason": "Interdit/déconseilllé pour vous",
        "parameters" : {
          "groups" : []
        }
    } 
  },

  "partitions": {
    "bigmem": {
      "disabled": [
        {"type": "min_memory"}
      ]
    },
    "parallel": {
      "discouraged": [
        {"type" : "full_node"} 
      ]
    },
    "shared" : {
      "discouraged":[
	{"type" : "full_node", "parameters" : {"CPUsPerNode" : 8}},
	{"type" : "min_memory", "parameters" : {"minMemory" : 1}} 	
      ]
    },"gpu" : {
      "discouraged" : [
        {"type" : "in_groups", "reason" : "Déconseillé pour votre groupe", 
         "parameters" : {"groups":["unige"]}}
      ]
    }
  },

  "parameters": {
    "sortedBy": "asc"
  },
  "version": "1.0"
}
