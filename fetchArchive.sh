currentDateTime=`date -u -d '3 hour ago' +"%Y-%m-%d-%H"`
wget `echo http://data.githubarchive.org/$currentDateTime.json.gz` -O out.json.gz
gunzip out.json.gz
ls -1 out.json | while read jsonfile; do mongoimport --uri $MONGO_STRING --collection $MONGO_COLLECTION --file $jsonfile  --batchSize 500; done
rm out.json