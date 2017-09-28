As agreed with James, now that we are not rebuilding the tree after each sponsorship, the polytomy resolution, subspecies deletion, etc etc should be done *after* the bespoke substitutions. The polytomy resolution and subspecies deletion can then be done by the `CSV_base_table_creator.py` script.  and , and downloaded various files as [documented](../../data/README.markdown).

# Settings

We assume you are running in a bash shell, so that you can define the following settings before you create a tree, and use them in the scripts below as `${OT_VERSION}` and `${OZ_TREE}`

```
OT_VERSION=9_1 #or whatever your OpenTree version is
OT_TAXONOMY_VERSION=3.0draft6 
OZ_TREE=AllLife #a tree directory in data/OZTreeBuild
```

In the instructions which follow, we assume that your tree version corresponds to that in the online OpenTree API. You can check this by running `curl -X POST https://api.opentreeoflife.org/v3/tree_of_life/about`, and also check that the taxonomy version in the API corresponds to that used in your tree, by running `curl -X POST https://api.opentreeoflife.org/v3/taxonomy/about`. If these do not match, the tree and taxonomy versions above, you may not fully map all the names in your tree in step 1 below.


# Preliminaries


First check that you have the required OpenTree, Wikimedia, and Encyclopedia of Life files, in particular `OZprivate/data/OpenTree/draftversion${OT_VERSION}.tre`, `OZprivate/data/OpenTree/ott/taxonomy.tsv`, `OZprivate/data/OpenTree/Wiki/wd_JSON`, `OZprivate/data/OpenTree/EOL/identifiers.csv` and for popularity calculations, `OZprivate/data/OpenTree/Wiki/wp_SQL` and `OZprivate/data/OpenTree/Wiki/wp_pagecounts`  (see [OZprivate/data/README.markdown](../../../OZprivate/data/README.markdown))

# Building a tree

The times given at the start of each of the following steps refer to the time taken to run the commands on the entire tree of life. 

If you already have your own newick tree with open tree ids on it already, and don't want to graft extra clades from the OpenTree, you can skip steps 1-4, and simply save the tree as `${OZ_TREE}_full_tree.phy` in your base directory. If you have a tree but it does not have ott numbers, then you can add them using step 1, and move the resulting tree in `BespokeTree/include_files` to `${OZ_TREE}_full_tree.phy` in your base directory.

## Create the tree


1. (10 mins) Use the [OpenTree API](https://github.com/OpenTreeOfLife/germinator/wiki/Synthetic-tree-API-v3) to add OTT ids to any non-opentree taxa in our own bespoke phylogenies (those in `*.phy` or `*.PHY` files). The new `.phy` and `.PHY` files will be created in a new directory within `OZprivate/data/OZTreeBuild/${OZ_TREE}/BespokeTree`, and a symlink to that directory will be created called `include_files` 
		
	```
	OZprivate/ServerScripts/TreeBuild/OTTMapping/Add_OTT_numbers_to_trees.py \
	--savein OZprivate/data/OZTreeBuild/${OZ_TREE}/BespokeTree/include_OTT${OT_TAXONOMY_VERSION} \
	OZprivate/data/OZTreeBuild/${OZ_TREE}/BespokeTree/include_noAutoOTT/*.[pP][hH][yY]
	```

2. Copy supplementary OpenTree-like newick files (if any) to the `OpenTree_all` directory. These are clades referenced in the OneZoom phylogeny that are missing from the OpenTree, and whose subtrees thus need to be supplied by hand. If any are required, they should be placed in the `OT_required` directory within `OZprivate/data/OZTreeBuild/${OZ_TREE}`. For tree building, they should be copied into the directory containing OpenTree subtrees using

	```
	(cd OZprivate/data/OZTreeBuild/${OZ_TREE}/OpenTreeParts && \
	 cp -n OT_required/*.nwk OpenTree_all/)
	```
	If you do not have any supplementary `.nwk` subtrees in the  `OT_required` directory, this step will output a warning, which can be ignored.

3. (15 mins) Construct OpenTree subtrees for inclusion from the `draftversion${OT_VERSION}.tre` file. The subtrees to be extracted are specified by inclusion strings in the `.PHY` files created in step 1. The command for this is `getOpenTreesFromOneZoom.py`, and it needs to be run from within the `OZprivate/data/OZTreeBuild/${OZ_TREE}` directory, as follows:

	```
	(cd OZprivate/data/OZTreeBuild/${OZ_TREE} && \
	 ../../../ServerScripts/TreeBuild/getOpenTreesFromOneZoom.py -v \
	 ../../OpenTree/draftversion${OT_VERSION}.tre \
	 OpenTreeParts/OpenTree_all/ -- -Inf \
	 BespokeTree/include_files/*.PHY \
	 > AdditionalFiles/substitute_commands_to_include_in_full_tree_js_file.txt)
	```
	If you are not including any OpenTree subtrees in your final tree, you should have no `.PHY` files, and this step will output a warning, which can be ignored.
	
4. (15 mins) substitute these subtrees into the main tree, and save the resulting full newick file using the hacky perl script: 

   ```
   cat OZprivate/data/OZTreeBuild/${OZ_TREE}/AdditionalFiles/base_tree.js \
   OZprivate/data/OZTreeBuild/${OZ_TREE}/AdditionalFiles/substitute_commands_to_include_in_full_tree_js_file.txt \
   > OZprivate/data/OZTreeBuild/${OZ_TREE}/${OZ_TREE}_full_tree.js;
   
   (cd OZprivate/data/OZTreeBuild/${OZ_TREE}/ && ../../../ServerScripts/TreeBuild/tree_and_meta_parser.pl -v \
   ${OZ_TREE}_full_tree.js \
   > ${OZ_TREE}_full_tree.phy)
   ```
   Now that we are not having to run this every sponsorship time, we should probably re-write this to actually know what tree structure looks like, maybe using Python/DendroPy (see https://github.com/jrosindell/OneZoomComplete/issues/340). Note that any '@' signs in the `${OZ_TREE}_full_tree.phy` output file are indicative of OpenTree substitutions that have not been possible: it would be good to check to see if there are other sources (or old OpenTree versions) that have trees for these nodes, and place them as .phy files in `OZprivate/data/OZTreeBuild/${OZ_TREE}/OpenTreeParts/OT_required/`. You can check with

   ```
   grep -o '.............@' OZprivate/data/OZTreeBuild/${OZ_TREE}/${OZ_TREE}_full_tree.phy
   ```
	You may also want to save a zipped version of the full tree file in a place where users can download it for reference purposes, in which case you can do

	```
	gzip < OZprivate/data/OZTreeBuild/${OZ_TREE}/${OZ_TREE}_full_tree.phy > static/FinalOutputs/${OZ_TREE}_full_tree.phy.gz
	```

	## create the base tree and table data
   
5. (4-8 hours) This is the long step. On the basis of the `${OZ_TREE}_full_tree.phy` file, look for ID mappings between different datasets, calculate popularity measures via wikidata/pedia, refine the tree (remove subspecies, randomly break polytomies, remove unifurcations etc), and then create corresponding database tables together with `ordered_tree_XXXXX.nwk`, `ordered_tree_XXXXX.poly` (same file but with polytomies marked with curly braces), and `ordered_tree_XXXXX.date` files (where XXXXX is the version number, usually a timestamp). Since round braces, curly braces, and commas are banned from the `simplified_ottnames` file, we can create minimal topology files by simply removing everything except these characters from the `.nwk` and `.poly` files. If the tree has been ladderised, with polytomies an unifurcations removed, the commas are also redundant, and can be removed. This is done in the next step, which saves these highly shortened strings into .js data files. 

	If you do not have comprehensive tree of a clade, it probably doesn't make sense to calculate popularity measures, and you can run this script with the `-p` flag (or omit the references to the `wp_` wikipedia files. Most of the time for this command is spent going throught the wikidata JSON dump, so if you want to save time and don't care about mapping to wikipedia items at all, you can omit the `wd_JSON` parameter too.
	
	```
	OZprivate/ServerScripts/TaxonMappingAndPopularity/CSV_base_table_creator.py \
	OZprivate/data/OZTreeBuild/${OZ_TREE}/${OZ_TREE}_full_tree.phy \
	OZprivate/data/OpenTree/ott/taxonomy.tsv \
	OZprivate/data/EOL/identifiers.csv \
	OZprivate/data/Wiki/wd_JSON/* \
	OZprivate/data/Wiki/wp_SQL/* \
	OZprivate/data/Wiki/wp_pagecounts/pagecount*.bz2 \
	-o OZprivate/data/output_files -v \
	--exclude Archosauria_ott335588 Dinosauria_ott90215 \
	--extra_source_file OZprivate/data/OZTreeBuild/${OZ_TREE}/BespokeTree/SupplementaryTaxonomy.tsv \
	> OZprivate/data/output_files/ordered_output.log
	```
6. (5 mins) turn the most recently saved tree files (saved in step (5) as `OZprivate/data/output_files/ordered_tree_XXXXXX.poly` and `ordered_dates_XXXXXX.json`) into bracketed newick strings in `static/FinalOutputs/data/basetree_XXXXXX.js`, `static/FinalOutputs/data/polytree_XXXXXX.js`, a cutpoints file in `static/FinalOutputs/data/cut_position_map_XXXXXX.js`, and a dates file in `static/FinalOutputs/data/dates_XXXXXX.json` as well as their gzipped equivalents, using 
	
	```
	OZprivate/ServerScripts/Utilities/make_js_treefiles.py
	```
	(see https://github.com/jrosindell/OneZoomComplete/issues/292)
7. (if so inclined). Update the static version of the Ancestor's Tale tree, by downloading it form the web to a static copy
    `curl -o ../static/trees/AT.html http://www.onezoom.org/AT.html;
    gzip -9kf ../static/trees/AT.html`
    
    ## upload data to the server and check it
    
8. Get the `basetree_XXXXXX.js`, `basetree_XXXXXX.js.gz`, `polytree_XXXXXX.js`, `polytree_XXXXXX.js.gz`, `cut_position_map_XXXXXX.js`, `cut_position_map_XXXXXX.js.gz`, `dates_XXXXXX.json`
, `dates_XXXXXX.json.gz`, `AT.html` & `AT.html.gz` files onto the server. I usually do this by pushing to Github then pulling the latest github changes to the server.
9. (15 mins) load the CSV tables into the DB on the server. Requires copying them to a local dir (e.g. using `scp -C` for compression) and then running a set of `LOAD DATA LOCAL INFILE` commands in mysql. If running mysql from the command line, requires you to start it with `mysql --local-infile`, e.g.:

   ```
   mysql --local-infile --host db.sundivenetworks.net --user onezoom --password --database onezoom_dev
   ```
10. Check for dups, and if any sponsors are no longer on the tree, using something like the following SQL command:

    ```
    select * from reservations left outer join ordered_leaves on reservations.OTT_ID = ordered_leaves.ott where ordered_leaves.ott is null and reservations.verified_name IS NOT NULL;
    select group_concat(id), group_concat(parent), group_concat(name), count(ott) from ordered_leaves group by ott having(count(ott) > 1)
    ```
    
    ## Fill in additional server fields

11. (15 mins) create example pictures for each node by percolating up. This requires the most recent `images_by_ott` table, so either do this on the main server, or (if you are doing it locally) update your `images_by_ott` to the most recent server version.

	```
	ServerScripts/Utilities/picProcess.py
	```
12. (5 mins) percolate the IUCN data up using 
	
	```
	ServerScripts/Utilities/IUCNquery.py
	```
	(note that this both updates the ICUN data in the DB and percolates up interior node info)
13. (10 mins) set the pricing structure using SET_PRICES.html (accessible from the management pages).
14. (5 mins - this does seem to be necessary for ordered nodes & ordered leaves). Make sure indexes are reset. Look at the commands at the end of db.py for the SQL to do this - they involve logging in to the SQL server (e.g. via Sequel Pro on Mac) and pasting all the drop index and create index commands.
    
    ## at last
15. Have a well deserved cup of tea