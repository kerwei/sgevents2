Udacity Project: Neighborhood Map

A single page Google Map application featuring the current events happening in Singapore. Location data is provided by the Google Maps Geocoding API while the event data is obtained from https://www.eventfinda.sg/.

Uses the jinja2 templating system.

Application demo found at https://udacity-gmap-166908.appspot.com/

REQUIREMENTS

1. Python 2.7 (https://www.python.org/downloads/)

2. Google Cloud SDK (https://cloud.google.com/sdk/docs/)

INSTRUCTIONS (WINDOWS)

1. Set up gcloud per the instructions on https://www.python.org/downloads/

2. Clone the repository https://github.com/kerwei/sgevents to local disk.

3. Update templates/index.html with your own Google Map API key at line 40.

4. From the Windows PowerShell, use Python to run the appserver and supply it with the path to the repository: python <SYSTEM_PATH_TO_GCLOUD_SDK>"\dev_appserver.py" <PATH_TO_REPOSITORY>

Example: python 'C:\Users\ObiWanKenobi\AppData\Local\Google\Cloud SDK\google-cloud-sdk
bin\dev_appserver.py' 'C:\Users\ObiWanKenobi\Documents\sgevents'