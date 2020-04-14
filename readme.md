This is an internal development project to add cnArcher workorder generation to the Logisense EngageIP Admin Portal.

The primary component of this project is the bundle.js and images that are used for a Custom Web-Component <cn-workorder />, this is a very generic reuseable component, however the sample pageextension is based on our own internal setup, and your various field names and noticeicon values most likely differ and will require tweaking. My recommendation is to examine the sample page extension and adopt it to meet your needs for adding cn-workorder's to your packages in the adminportal.

npm run build - builds output to dist/*, content's should be copied to EngageIP adminportal and accessible as AdminPortal/cnArcher/*
npm run web - starts dev-server with setup accessible via http://localhost:3000/sample.htm

To deploy: 

- Build with the npm build script.
- Copy Files as recommended to AdminPortal/cnArcher/ on the adminportal server
- In the EngageIP admin portal add a new page extension 
  - Page Setting: Set to overview/index to target customer overview pages only.
  - Content: Should be set to the static/pageextension.js sample.
- Test the extension by visiting a customer that has a package with a 0a-00-3e ESN. 

The pageextension-example.js looks through the clients overview page, finds the various package noticeicons that are used for mouse over package data, it then appends a cn-workorder custom element next to that notice icon that is the trigger for the new web-component modal window for generating workorders.