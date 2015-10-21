echo "

# Naming Conventions of Modules in UI projects

Detailed log "what is used where" is available in:

	cat UI/gjax-tools-ui/src/main/sh/grasp/lib/amd-aliases.debug.log

To find where alias is used:

	grep -i "htlm"  UI/gjax-tools-ui/src/main/sh/grasp/lib/amd-aliases.debug.log

To list top gjax modules used:

	grep ^gjax UI/gjax-tools-ui/src/main/sh/grasp/lib/amd-aliases.debug.log \
	| cut -f1 | sort | uniq -c | sort -nr
	
To find modules with multiple names:

	git grep "," UI/gjax-tools-ui/src/main/sh/grasp/lib/amd-aliases.md

Dump of current configuration:

## For UI/*-ui/ files

$(
	main
	# FIXME: UI scope to UI/*-ui
	node UI/gjax-tools-ui/src/main/sh/grasp/lib/amd-aliases.js $(list_projects_ui | sufix "/src/main/webapp/WEB-INF/views") \
	2>UI/gjax-tools-ui/src/main/sh/grasp/lib/amd-aliases.debug.log \
	| md-escape-emphasis
)

## For gjax files

$(

	main
	# FIXME: UI scope to UI/*-ui
	node UI/gjax-tools-ui/src/main/sh/grasp/lib/amd-aliases.js UI/app-ui/src/main/webapp/resources/gjax \
	2>>UI/gjax-tools-ui/src/main/sh/grasp/lib/amd-aliases.debug.log \
	| md-escape-emphasis
)

"
