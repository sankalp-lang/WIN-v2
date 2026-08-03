/* ============================================================
   WiN · app-wide translation layer
   The views render English template literals directly (no build step,
   no per-string T() calls). Rather than retrofit ~13k lines across 28
   view files, this runs a translation pass over the rendered DOM after
   every navigate/modal open: each text node's normalised content is
   looked up in the dictionary below and swapped in place.

   Consequences worth knowing:
   - Coverage == dictionary coverage. A phrase not listed here stays in
     English; adding a key is all it takes to translate it everywhere.
   - Matching is whole-text-node and exact (after whitespace collapse),
     so it can never mangle a partially-matched sentence.
   - Proper nouns (EPFO, ESIC, Maharashtra, employer names) are
     deliberately absent — they should not be translated.
   ============================================================ */
(function () {
  if (!window.App) return;

  // ---- Hindi ----
  const HI = {
    // statuses
    'Verified': 'सत्यापित', 'Pending': 'लंबित', 'In Progress': 'प्रगति पर', 'Resolved': 'हल हो गया',
    'Active': 'सक्रिय', 'Inactive': 'निष्क्रिय', 'Completed': 'पूर्ण', 'Escalated': 'आगे बढ़ाया गया',
    'Under Review': 'समीक्षाधीन', 'Pending Review': 'समीक्षा लंबित', 'Filed': 'दाखिल', 'Overdue': 'अतिदेय',
    'Approved': 'स्वीकृत', 'Rejected': 'अस्वीकृत', 'Connected': 'जुड़ा हुआ', 'Enrolled': 'नामांकित',
    'On track': 'सही दिशा में', 'Watch': 'निगरानी', 'Off track': 'पटरी से उतरा', 'Not Started': 'शुरू नहीं हुआ',
    'Open': 'खुला', 'Closed': 'बंद', 'Assigned': 'सौंपा गया', 'Responded': 'उत्तर दिया', 'Draft': 'मसौदा',
    'Failed': 'असफल', 'Expired': 'समाप्त', 'Flagged': 'चिह्नित', 'Linked': 'संलग्न', 'Live': 'लाइव',
    'Identity verified': 'पहचान सत्यापित', 'Digitally Verified': 'डिजिटल रूप से सत्यापित',
    'Currently Active': 'वर्तमान में सक्रिय', 'All clear': 'सब ठीक है',

    // priorities / levels
    'High': 'उच्च', 'Medium': 'मध्यम', 'Low': 'निम्न', 'Very High': 'बहुत उच्च', 'Rising': 'बढ़ रहा',
    'Critical': 'गंभीर', 'Normal': 'सामान्य', 'Urgent': 'अत्यावश्यक',
    'Beginner': 'प्रारंभिक', 'Intermediate': 'मध्यवर्ती', 'Advanced': 'उन्नत', 'Expert': 'विशेषज्ञ',

    // actions
    'Cancel': 'रद्द करें', 'Close': 'बंद करें', 'Save': 'सहेजें', 'Save Changes': 'परिवर्तन सहेजें',
    'Submit': 'जमा करें', 'Download': 'डाउनलोड', 'Export': 'निर्यात', 'View': 'देखें', 'View all': 'सभी देखें',
    'Approve': 'स्वीकृत करें', 'Reject': 'अस्वीकार करें', 'Review': 'समीक्षा करें', 'Respond': 'उत्तर दें',
    'Resolve': 'हल करें', 'Apply': 'आवेदन करें', 'Continue': 'जारी रखें', 'Back': 'वापस', 'Next': 'आगे',
    'Add': 'जोड़ें', 'Remove': 'हटाएं', 'Edit': 'संपादित करें', 'Search': 'खोजें', 'Search…': 'खोजें…',
    'Send': 'भेजें', 'Verify': 'सत्यापित करें', 'Confirm': 'पुष्टि करें', 'Done': 'पूर्ण', 'Clear': 'साफ़ करें',
    'Previous': 'पिछला', 'Show Less': 'कम दिखाएं', 'Show less': 'कम दिखाएं', 'Reconnect': 'फिर से जोड़ें',
    'Disconnect': 'अलग करें', 'Copy': 'कॉपी करें', 'Copy link': 'लिंक कॉपी करें', 'Share': 'साझा करें',
    'Email': 'ईमेल', 'WhatsApp': 'व्हाट्सएप', 'Enter': 'दर्ज करें', 'Enter OTP': 'ओटीपी दर्ज करें',
    'Send OTP': 'ओटीपी भेजें', 'Resend OTP': 'ओटीपी दोबारा भेजें', 'Switch persona': 'भूमिका बदलें',
    'View & Apply': 'देखें और आवेदन करें', 'File Return': 'विवरणी दाखिल करें', 'Export Report': 'रिपोर्ट निर्यात करें',
    'Download Profile': 'प्रोफ़ाइल डाउनलोड करें', 'Public profile': 'सार्वजनिक प्रोफ़ाइल',
    'Find jobs': 'नौकरी खोजें', 'Ask Diya': 'दीया से पूछें', 'Ask WiN': 'WiN से पूछें',
    'Sent Successfully!': 'सफलतापूर्वक भेजा गया!', 'Verify & Continue': 'सत्यापित करें और जारी रखें',

    // common field labels
    'Status': 'स्थिति', 'Category': 'श्रेणी', 'Priority': 'प्राथमिकता', 'Location': 'स्थान', 'Role': 'भूमिका',
    'State': 'राज्य', 'District': 'ज़िला', 'Subject': 'विषय', 'Worker': 'श्रमिक', 'Employer': 'नियोक्ता',
    'Employee': 'कर्मचारी', 'Employees': 'कर्मचारी', 'Description': 'विवरण', 'Details': 'विवरण',
    'Amount': 'राशि', 'Period': 'अवधि', 'Due Date': 'नियत तिथि', 'Action': 'कार्रवाई', 'Actions': 'कार्रवाई',
    'Full Name': 'पूरा नाम', 'Phone': 'फ़ोन', 'Address': 'पता', 'Company': 'कंपनी', 'Site': 'साइट',
    'Case ID': 'केस आईडी', 'Document': 'दस्तावेज़', 'Uploaded': 'अपलोड किया गया', 'Score': 'स्कोर',
    'Sample Size': 'नमूना आकार', 'Primary Driver': 'मुख्य कारण', 'Benchmark': 'मानक',
    'Current': 'वर्तमान', 'Last Month': 'पिछला माह', 'National Benchmark': 'राष्ट्रीय मानक',
    'Hotspot': 'हॉटस्पॉट', 'Hotspot:': 'हॉटस्पॉट:', 'Data source:': 'डेटा स्रोत:', 'Designation': 'पदनाम',
    'Employee Name': 'कर्मचारी का नाम', 'Date of Joining': 'कार्यग्रहण तिथि', 'Value': 'मान',
    'Enrolled': 'नामांकित', 'Employers': 'नियोक्ता', 'Grievances': 'शिकायतें', 'Verification': 'सत्यापन',
    'Earnings': 'आय', 'Deductions': 'कटौतियाँ', 'Net Pay': 'शुद्ध वेतन', 'Basic Pay': 'मूल वेतन',
    'Title': 'शीर्षक', 'Message Body': 'संदेश विवरण', 'Target Audience': 'लक्षित दर्शक',
    'Enrolled since': 'से नामांकित', 'Coverage / Benefit': 'कवरेज / लाभ',

    // nav & page headings
    'Dashboard': 'डैशबोर्ड', 'Overview': 'अवलोकन', 'Home': 'होम', 'Settings': 'सेटिंग्स',
    'Reports': 'रिपोर्ट', 'Compliance': 'अनुपालन', 'Recruitment': 'भर्ती', 'Enrollment': 'नामांकन',
    'Demographics': 'जनसांख्यिकी', 'Help & Support': 'सहायता और समर्थन', 'Profile & Settings': 'प्रोफ़ाइल और सेटिंग्स',
    'My Work History': 'मेरा कार्य इतिहास', 'Benefits': 'लाभ', 'Benefits & Schemes': 'लाभ और योजनाएं',
    'Skill Advisor': 'कौशल सलाहकार', 'Jobs & Resources': 'नौकरियां और संसाधन', 'Skills': 'कौशल',
    'Courses': 'पाठ्यक्रम', 'Personal Information': 'व्यक्तिगत जानकारी', 'Work Experience': 'कार्य अनुभव',
    'Education': 'शिक्षा', 'Verification Status': 'सत्यापन स्थिति', 'Recent Activity': 'हाल की गतिविधि',
    'Key Indicators': 'मुख्य संकेतक', 'Risk Vigilance': 'जोखिम निगरानी', 'Compliance Gaps': 'अनुपालन अंतर',
    'Compliance Returns': 'अनुपालन विवरणी', 'Grievances Overview': 'शिकायत अवलोकन',
    'Manual Verification': 'मैनुअल सत्यापन', 'HRMS Sync': 'HRMS सिंक', 'API & Docs': 'API और दस्तावेज़',
    'National snapshot': 'राष्ट्रीय स्नैपशॉट', 'Sector Distribution': 'क्षेत्रवार वितरण',
    'Enrollment Trend': 'नामांकन प्रवृत्ति', 'State-wise Enrollment': 'राज्यवार नामांकन',
    'Total Employees': 'कुल कर्मचारी', 'Verification Requests': 'सत्यापन अनुरोध',
    'Work Profile': 'कार्य प्रोफ़ाइल', 'Recent Cases': 'हाल के मामले', 'Cases by Category': 'श्रेणी अनुसार मामले',
    'Cases by Site': 'साइट अनुसार मामले', 'Push Schemes & Alerts': 'योजनाएं और अलर्ट भेजें',
    'Schemes Eligible For': 'पात्र योजनाएं', 'Schemes Enrolled In': 'नामांकित योजनाएं',
    'Skills & Certifications': 'कौशल और प्रमाणन', 'Your Certified Skills': 'आपके प्रमाणित कौशल',
    'Top Skills in Your Field': 'आपके क्षेत्र के प्रमुख कौशल', 'Grievance Cases': 'शिकायत मामले',
    'Quick Templates': 'त्वरित टेम्पलेट', 'Recent Pushes': 'हाल में भेजे गए',
    'Compose Push Notification': 'सूचना तैयार करें', 'Live Resolution Tracker': 'लाइव समाधान ट्रैकर',
    'Open Cases': 'खुले मामले', 'Total Filed': 'कुल दाखिल', 'Avg. Resolution': 'औसत समाधान',
    'File New Grievance': 'नई शिकायत दर्ज करें', 'Two-Factor Authentication': 'द्वि-कारक प्रमाणीकरण',

    // employment relationships / worker segments
    'Direct, Full-Time Employee': 'सीधा, पूर्णकालिक कर्मचारी', 'Contract Worker': 'संविदा श्रमिक',
    'Gig Worker': 'गिग श्रमिक', 'Self-Employed Worker': 'स्वनियोजित श्रमिक',
    'Farmer / Other Worker': 'किसान / अन्य श्रमिक', 'Full-Time': 'पूर्णकालिक', 'Full-time': 'पूर्णकालिक',
    'Contract': 'संविदा', 'Gig': 'गिग', 'Self-Employed': 'स्वनियोजित', 'Informal': 'अनौपचारिक',
    'Government': 'सरकारी', 'Non-Government': 'गैर-सरकारी', 'All Registered Workers': 'सभी पंजीकृत श्रमिक',
    'Construction Workers': 'निर्माण श्रमिक', 'Unorganised Sector': 'असंगठित क्षेत्र',
    'All Users': 'सभी उपयोगकर्ता', 'Workers Only': 'केवल श्रमिक', 'Employers Only': 'केवल नियोक्ता',
    'All States': 'सभी राज्य', 'All': 'सभी',

    // sectors
    'Construction': 'निर्माण', 'Manufacturing': 'विनिर्माण', 'Agriculture': 'कृषि',
    'Agriculture & Allied': 'कृषि एवं संबद्ध', 'Gig & Platform': 'गिग एवं प्लेटफ़ॉर्म',
    'Domestic & Services': 'घरेलू एवं सेवाएं', 'Services': 'सेवाएं', 'Others': 'अन्य',
    'Electrical': 'विद्युत', 'Domestic Workers': 'घरेलू श्रमिक',

    // metrics
    'Workers Enrolled': 'नामांकित श्रमिक', 'Employers Registered': 'पंजीकृत नियोक्ता',
    'Active Grievances': 'सक्रिय शिकायतें', 'Verification Rate': 'सत्यापन दर',
    'Formal Employment Share': 'औपचारिक रोज़गार हिस्सा', 'Avg. Verification Turnaround': 'औसत सत्यापन अवधि',
    'Minimum Wage Compliance': 'न्यूनतम वेतन अनुपालन', 'Skilling Coverage': 'कौशल कवरेज',
    'Interstate Migrant Share': 'अंतरराज्यीय प्रवासी हिस्सा',
    'Employer Compliance Filing Rate': 'नियोक्ता अनुपालन दाखिल दर',
    'e-Shram Enrollment Growth': 'ई-श्रम नामांकन वृद्धि',
    'ESIC Claims Pending 45+ Days': '45+ दिन से लंबित ESIC दावे',
    'EPFO Non-Compliant Employers': 'EPFO गैर-अनुपालक नियोक्ता',
    'Resolution Rate': 'समाधान दर', 'Avg. Resolution Time': 'औसत समाधान समय',
    'Currently Open': 'वर्तमान में खुले', 'Total Cases': 'कुल मामले', 'Total Returns': 'कुल विवरणी',
    'Certified skills': 'प्रमाणित कौशल', 'Courses in progress': 'चालू पाठ्यक्रम',
    'Total Allotted (₹ Cr)': 'कुल आवंटित (₹ करोड़)', 'Total Covered (₹ Cr)': 'कुल कवर (₹ करोड़)',
    'Schemes Tracked': 'ट्रैक की गई योजनाएं', 'openings': 'रिक्तियां', 'pending': 'लंबित',
    'open': 'खुले', 'resolved': 'हल हुए', 'matched': 'मेल खाते', 'on roster': 'सूची में',

    // hero / lead copy
    "India's workforce, in one command center.": 'भारत का कार्यबल, एक कमांड सेंटर में।',
    'Stay ahead of every filing.': 'हर दाखिले में आगे रहें।',
    'Every worker, verified at source.': 'हर श्रमिक, स्रोत पर सत्यापित।',
    'Earn More by Upskilling Yourself.': 'कौशल बढ़ाकर अधिक कमाएं।',
    'Your verified golden record.': 'आपका सत्यापित स्वर्ण अभिलेख।',
    'Every grievance, tracked to resolution.': 'हर शिकायत, समाधान तक ट्रैक।',
    "Every scheme you're entitled to, in one place.": 'आपके सभी हक़ की योजनाएं, एक जगह।',
    'Money allotted vs. money covered, by scheme.': 'योजना अनुसार आवंटित बनाम कवर राशि।',
    'Sync your HRMS, verify at the source.': 'अपना HRMS सिंक करें, स्रोत पर सत्यापित करें।',
    'Ministry of Labour & Employment': 'श्रम एवं रोज़गार मंत्रालय',
    'Government Registry': 'सरकारी रजिस्ट्री', 'Registry Console': 'रजिस्ट्री कंसोल',
    'Employer Console': 'नियोक्ता कंसोल', 'Worker Portal': 'श्रमिक पोर्टल',
    'Bharat Karamsheel Setu': 'भारत कर्मशील सेतु',
    'National labour-data command center': 'राष्ट्रीय श्रम-डेटा कमांड सेंटर',
    'Verified worker identity': 'सत्यापित श्रमिक पहचान',
    'Grievance redressal': 'शिकायत निवारण', 'Skill advisor': 'कौशल सलाहकार',
    'Verification console': 'सत्यापन कंसोल', 'Setup required': 'सेटअप आवश्यक',
    'Confirm with OTP': 'ओटीपी से पुष्टि करें', 'Scheme Details': 'योजना विवरण',
    'Manual Document Review': 'मैनुअल दस्तावेज़ समीक्षा',
    'Manual Document Verification': 'मैनुअल दस्तावेज़ सत्यापन',
  };

  // ---- Marathi ----
  const MR = {
    'Verified': 'सत्यापित', 'Pending': 'प्रलंबित', 'In Progress': 'प्रगतीपथावर', 'Resolved': 'निराकरण झाले',
    'Active': 'सक्रिय', 'Inactive': 'निष्क्रिय', 'Completed': 'पूर्ण', 'Escalated': 'वरिष्ठांकडे पाठवले',
    'Under Review': 'पुनरावलोकनाधीन', 'Pending Review': 'पुनरावलोकन प्रलंबित', 'Filed': 'दाखल', 'Overdue': 'मुदतबाह्य',
    'Approved': 'मंजूर', 'Rejected': 'नामंजूर', 'Connected': 'जोडलेले', 'Enrolled': 'नोंदणीकृत',
    'On track': 'योग्य मार्गावर', 'Watch': 'निरीक्षण', 'Off track': 'मार्गावरून घसरले', 'Not Started': 'सुरू झाले नाही',
    'Open': 'खुले', 'Closed': 'बंद', 'Assigned': 'नियुक्त', 'Responded': 'उत्तर दिले', 'Draft': 'मसुदा',
    'Failed': 'अयशस्वी', 'Expired': 'मुदत संपली', 'Flagged': 'चिन्हांकित', 'Linked': 'संलग्न', 'Live': 'थेट',
    'Identity verified': 'ओळख सत्यापित', 'Digitally Verified': 'डिजिटल स्वरूपात सत्यापित',
    'Currently Active': 'सध्या सक्रिय', 'All clear': 'सर्व ठीक',

    'High': 'उच्च', 'Medium': 'मध्यम', 'Low': 'कमी', 'Very High': 'अत्यंत उच्च', 'Rising': 'वाढत आहे',
    'Critical': 'गंभीर', 'Normal': 'सामान्य', 'Urgent': 'तातडीचे',
    'Beginner': 'प्रारंभिक', 'Intermediate': 'मध्यम', 'Advanced': 'प्रगत', 'Expert': 'तज्ज्ञ',

    'Cancel': 'रद्द करा', 'Close': 'बंद करा', 'Save': 'जतन करा', 'Save Changes': 'बदल जतन करा',
    'Submit': 'सादर करा', 'Download': 'डाउनलोड', 'Export': 'निर्यात', 'View': 'पहा', 'View all': 'सर्व पहा',
    'Approve': 'मंजूर करा', 'Reject': 'नामंजूर करा', 'Review': 'पुनरावलोकन करा', 'Respond': 'उत्तर द्या',
    'Resolve': 'निराकरण करा', 'Apply': 'अर्ज करा', 'Continue': 'सुरू ठेवा', 'Back': 'मागे', 'Next': 'पुढे',
    'Add': 'जोडा', 'Remove': 'काढा', 'Edit': 'संपादित करा', 'Search': 'शोधा', 'Search…': 'शोधा…',
    'Send': 'पाठवा', 'Verify': 'सत्यापित करा', 'Confirm': 'निश्चित करा', 'Done': 'पूर्ण', 'Clear': 'साफ करा',
    'Previous': 'मागील', 'Show Less': 'कमी दाखवा', 'Show less': 'कमी दाखवा', 'Reconnect': 'पुन्हा जोडा',
    'Disconnect': 'वेगळे करा', 'Copy': 'कॉपी करा', 'Copy link': 'लिंक कॉपी करा', 'Share': 'सामायिक करा',
    'Email': 'ईमेल', 'WhatsApp': 'व्हॉट्सॅप', 'Enter': 'प्रविष्ट करा', 'Enter OTP': 'ओटीपी प्रविष्ट करा',
    'Send OTP': 'ओटीपी पाठवा', 'Resend OTP': 'ओटीपी पुन्हा पाठवा', 'Switch persona': 'भूमिका बदला',
    'View & Apply': 'पहा आणि अर्ज करा', 'File Return': 'विवरणपत्र दाखल करा', 'Export Report': 'अहवाल निर्यात करा',
    'Download Profile': 'प्रोफाइल डाउनलोड करा', 'Public profile': 'सार्वजनिक प्रोफाइल',
    'Find jobs': 'नोकऱ्या शोधा', 'Ask Diya': 'दियाला विचारा', 'Ask WiN': 'WiN ला विचारा',
    'Sent Successfully!': 'यशस्वीरित्या पाठवले!', 'Verify & Continue': 'सत्यापित करा आणि सुरू ठेवा',

    'Status': 'स्थिती', 'Category': 'श्रेणी', 'Priority': 'प्राधान्य', 'Location': 'ठिकाण', 'Role': 'भूमिका',
    'State': 'राज्य', 'District': 'जिल्हा', 'Subject': 'विषय', 'Worker': 'कामगार', 'Employer': 'नियोक्ता',
    'Employee': 'कर्मचारी', 'Employees': 'कर्मचारी', 'Description': 'वर्णन', 'Details': 'तपशील',
    'Amount': 'रक्कम', 'Period': 'कालावधी', 'Due Date': 'देय दिनांक', 'Action': 'कृती', 'Actions': 'कृती',
    'Full Name': 'पूर्ण नाव', 'Phone': 'दूरध्वनी', 'Address': 'पत्ता', 'Company': 'कंपनी', 'Site': 'साइट',
    'Case ID': 'प्रकरण आयडी', 'Document': 'दस्तऐवज', 'Uploaded': 'अपलोड केले', 'Score': 'गुण',
    'Sample Size': 'नमुना आकार', 'Primary Driver': 'मुख्य कारण', 'Benchmark': 'मानक',
    'Current': 'सध्याचे', 'Last Month': 'गेला महिना', 'National Benchmark': 'राष्ट्रीय मानक',
    'Hotspot': 'हॉटस्पॉट', 'Hotspot:': 'हॉटस्पॉट:', 'Data source:': 'डेटा स्रोत:', 'Designation': 'पदनाम',
    'Employee Name': 'कर्मचाऱ्याचे नाव', 'Date of Joining': 'रुजू दिनांक', 'Value': 'मूल्य',
    'Employers': 'नियोक्ते', 'Grievances': 'तक्रारी', 'Verification': 'सत्यापन',
    'Earnings': 'उत्पन्न', 'Deductions': 'वजावटी', 'Net Pay': 'निव्वळ वेतन', 'Basic Pay': 'मूळ वेतन',
    'Title': 'शीर्षक', 'Message Body': 'संदेश तपशील', 'Target Audience': 'लक्षित प्रेक्षक',
    'Enrolled since': 'पासून नोंदणीकृत', 'Coverage / Benefit': 'कव्हरेज / लाभ',

    'Dashboard': 'डॅशबोर्ड', 'Overview': 'आढावा', 'Home': 'मुख्यपृष्ठ', 'Settings': 'सेटिंग्ज',
    'Reports': 'अहवाल', 'Compliance': 'अनुपालन', 'Recruitment': 'भरती', 'Enrollment': 'नोंदणी',
    'Demographics': 'लोकसंख्याशास्त्र', 'Help & Support': 'मदत आणि सहाय्य', 'Profile & Settings': 'प्रोफाइल आणि सेटिंग्ज',
    'My Work History': 'माझा कामाचा इतिहास', 'Benefits': 'लाभ', 'Benefits & Schemes': 'लाभ आणि योजना',
    'Skill Advisor': 'कौशल्य सल्लागार', 'Jobs & Resources': 'नोकऱ्या आणि संसाधने', 'Skills': 'कौशल्ये',
    'Courses': 'अभ्यासक्रम', 'Personal Information': 'वैयक्तिक माहिती', 'Work Experience': 'कामाचा अनुभव',
    'Education': 'शिक्षण', 'Verification Status': 'सत्यापन स्थिती', 'Recent Activity': 'अलीकडील घडामोडी',
    'Key Indicators': 'प्रमुख निर्देशक', 'Risk Vigilance': 'जोखीम सतर्कता', 'Compliance Gaps': 'अनुपालन तुटी',
    'Compliance Returns': 'अनुपालन विवरणपत्रे', 'Grievances Overview': 'तक्रार आढावा',
    'Manual Verification': 'मॅन्युअल सत्यापन', 'HRMS Sync': 'HRMS सिंक', 'API & Docs': 'API आणि दस्तऐवज',
    'National snapshot': 'राष्ट्रीय स्नॅपशॉट', 'Sector Distribution': 'क्षेत्रनिहाय वितरण',
    'Enrollment Trend': 'नोंदणी कल', 'State-wise Enrollment': 'राज्यनिहाय नोंदणी',
    'Total Employees': 'एकूण कर्मचारी', 'Verification Requests': 'सत्यापन विनंत्या',
    'Work Profile': 'कार्य प्रोफाइल', 'Recent Cases': 'अलीकडील प्रकरणे', 'Cases by Category': 'श्रेणीनिहाय प्रकरणे',
    'Cases by Site': 'साइटनिहाय प्रकरणे', 'Push Schemes & Alerts': 'योजना आणि सूचना पाठवा',
    'Schemes Eligible For': 'पात्र योजना', 'Schemes Enrolled In': 'नोंदणीकृत योजना',
    'Skills & Certifications': 'कौशल्ये आणि प्रमाणपत्रे', 'Your Certified Skills': 'तुमची प्रमाणित कौशल्ये',
    'Top Skills in Your Field': 'तुमच्या क्षेत्रातील प्रमुख कौशल्ये', 'Grievance Cases': 'तक्रार प्रकरणे',
    'Quick Templates': 'झटपट टेम्पलेट', 'Recent Pushes': 'अलीकडे पाठवलेले',
    'Compose Push Notification': 'सूचना तयार करा', 'Live Resolution Tracker': 'थेट निराकरण ट्रॅकर',
    'Open Cases': 'खुली प्रकरणे', 'Total Filed': 'एकूण दाखल', 'Avg. Resolution': 'सरासरी निराकरण',
    'File New Grievance': 'नवीन तक्रार दाखल करा', 'Two-Factor Authentication': 'द्वि-घटक प्रमाणीकरण',

    'Direct, Full-Time Employee': 'थेट, पूर्णवेळ कर्मचारी', 'Contract Worker': 'कंत्राटी कामगार',
    'Gig Worker': 'गिग कामगार', 'Self-Employed Worker': 'स्वयंरोजगार कामगार',
    'Farmer / Other Worker': 'शेतकरी / इतर कामगार', 'Full-Time': 'पूर्णवेळ', 'Full-time': 'पूर्णवेळ',
    'Contract': 'कंत्राटी', 'Gig': 'गिग', 'Self-Employed': 'स्वयंरोजगार', 'Informal': 'अनौपचारिक',
    'Government': 'शासकीय', 'Non-Government': 'अशासकीय', 'All Registered Workers': 'सर्व नोंदणीकृत कामगार',
    'Construction Workers': 'बांधकाम कामगार', 'Unorganised Sector': 'असंघटित क्षेत्र',
    'All Users': 'सर्व वापरकर्ते', 'Workers Only': 'केवळ कामगार', 'Employers Only': 'केवळ नियोक्ते',
    'All States': 'सर्व राज्ये', 'All': 'सर्व',

    'Construction': 'बांधकाम', 'Manufacturing': 'उत्पादन', 'Agriculture': 'शेती',
    'Agriculture & Allied': 'शेती व संलग्न', 'Gig & Platform': 'गिग व प्लॅटफॉर्म',
    'Domestic & Services': 'घरगुती व सेवा', 'Services': 'सेवा', 'Others': 'इतर',
    'Electrical': 'विद्युत', 'Domestic Workers': 'घरगुती कामगार',

    'Workers Enrolled': 'नोंदणीकृत कामगार', 'Employers Registered': 'नोंदणीकृत नियोक्ते',
    'Active Grievances': 'सक्रिय तक्रारी', 'Verification Rate': 'सत्यापन दर',
    'Formal Employment Share': 'औपचारिक रोजगार वाटा', 'Avg. Verification Turnaround': 'सरासरी सत्यापन कालावधी',
    'Minimum Wage Compliance': 'किमान वेतन अनुपालन', 'Skilling Coverage': 'कौशल्य कव्हरेज',
    'Interstate Migrant Share': 'आंतरराज्य स्थलांतरित वाटा',
    'Employer Compliance Filing Rate': 'नियोक्ता अनुपालन दाखल दर',
    'e-Shram Enrollment Growth': 'ई-श्रम नोंदणी वाढ',
    'ESIC Claims Pending 45+ Days': '45+ दिवस प्रलंबित ESIC दावे',
    'EPFO Non-Compliant Employers': 'EPFO अनुपालन न करणारे नियोक्ते',
    'Resolution Rate': 'निराकरण दर', 'Avg. Resolution Time': 'सरासरी निराकरण वेळ',
    'Currently Open': 'सध्या खुली', 'Total Cases': 'एकूण प्रकरणे', 'Total Returns': 'एकूण विवरणपत्रे',
    'Certified skills': 'प्रमाणित कौशल्ये', 'Courses in progress': 'चालू अभ्यासक्रम',
    'Total Allotted (₹ Cr)': 'एकूण वाटप (₹ कोटी)', 'Total Covered (₹ Cr)': 'एकूण कव्हर (₹ कोटी)',
    'Schemes Tracked': 'ट्रॅक केलेल्या योजना', 'openings': 'रिक्त जागा', 'pending': 'प्रलंबित',
    'open': 'खुली', 'resolved': 'निराकरण झाली', 'matched': 'जुळणारे', 'on roster': 'यादीत',

    "India's workforce, in one command center.": 'भारताचे कार्यबल, एका कमांड सेंटरमध्ये।',
    'Stay ahead of every filing.': 'प्रत्येक दाखल्याच्या पुढे राहा।',
    'Every worker, verified at source.': 'प्रत्येक कामगार, स्रोतावर सत्यापित।',
    'Earn More by Upskilling Yourself.': 'कौशल्य वाढवून अधिक कमवा।',
    'Your verified golden record.': 'तुमचा सत्यापित सुवर्ण अभिलेख।',
    'Every grievance, tracked to resolution.': 'प्रत्येक तक्रार, निराकरणापर्यंत ट्रॅक।',
    "Every scheme you're entitled to, in one place.": 'तुमच्या हक्काच्या सर्व योजना, एकाच ठिकाणी।',
    'Money allotted vs. money covered, by scheme.': 'योजनानिहाय वाटप विरुद्ध कव्हर रक्कम।',
    'Sync your HRMS, verify at the source.': 'तुमचा HRMS सिंक करा, स्रोतावर सत्यापित करा।',
    'Ministry of Labour & Employment': 'श्रम व रोजगार मंत्रालय',
    'Government Registry': 'शासकीय नोंदवही', 'Registry Console': 'नोंदवही कन्सोल',
    'Employer Console': 'नियोक्ता कन्सोल', 'Worker Portal': 'कामगार पोर्टल',
    'Bharat Karamsheel Setu': 'भारत कर्मशील सेतू',
    'National labour-data command center': 'राष्ट्रीय श्रम-डेटा कमांड सेंटर',
    'Verified worker identity': 'सत्यापित कामगार ओळख',
    'Grievance redressal': 'तक्रार निवारण', 'Skill advisor': 'कौशल्य सल्लागार',
    'Verification console': 'सत्यापन कन्सोल', 'Setup required': 'सेटअप आवश्यक',
    'Confirm with OTP': 'ओटीपीने निश्चित करा', 'Scheme Details': 'योजना तपशील',
    'Manual Document Review': 'मॅन्युअल दस्तऐवज पुनरावलोकन',
    'Manual Document Verification': 'मॅन्युअल दस्तऐवज सत्यापन',
  };

  // ---- second pass: strings surfaced by auditing every page for text nodes that
  // had no dictionary hit (report column headers, skill names, inline fragments) ----
  Object.assign(HI, {
    // report / indicator column headers
    'Sector': 'क्षेत्र', 'Current Workers': 'वर्तमान श्रमिक', 'Previous Year Workers': 'पिछले वर्ष के श्रमिक',
    'YoY Growth %': 'वार्षिक वृद्धि %', 'Formal Share %': 'औपचारिक हिस्सा %', 'Female Share %': 'महिला हिस्सा %',
    'Avg Monthly Wage (₹)': 'औसत मासिक वेतन (₹)', 'WIN-Verified Workers': 'WIN-सत्यापित श्रमिक',
    'Employers Registered': 'पंजीकृत नियोक्ता', 'Informal Sub-sector': 'अनौपचारिक उप-क्षेत्र',
    'Headcount': 'कुल संख्या', 'PF Coverage %': 'पीएफ कवरेज %', 'ESIC Coverage %': 'ईएसआईसी कवरेज %',
    'Avg Daily Wage (₹)': 'औसत दैनिक वेतन (₹)', 'WIN-Verified %': 'WIN-सत्यापित %',
    'Social Security Gap %': 'सामाजिक सुरक्षा अंतर %', 'Women Share %': 'महिला हिस्सा %',
    'Graduation Stream': 'स्नातक संवर्ग', 'First-Employment Sector': 'प्रथम रोज़गार क्षेत्र',
    'Placed (count)': 'नियुक्त (संख्या)', 'Share of Stream %': 'संवर्ग हिस्सा %',
    'Avg Entry Wage (₹/mo)': 'औसत प्रारंभिक वेतन (₹/माह)', 'Skill-Match %': 'कौशल-मेल %',
    'Median Months to Placement': 'नियुक्ति तक औसत माह', 'Skill Level': 'कौशल स्तर',
    'Median Wage (₹/mo)': 'माध्य वेतन (₹/माह)', 'Mean Wage (₹/mo)': 'औसत वेतन (₹/माह)',
    'Origin State': 'मूल राज्य', 'Destination State': 'गंतव्य राज्य', 'Workers (est.)': 'श्रमिक (अनुमानित)',
    'Dominant Sector': 'प्रमुख क्षेत्र', 'Peak Season': 'व्यस्त मौसम', 'Avg Stay (months)': 'औसत प्रवास (माह)',
    'Benefit Portability Eligible %': 'लाभ पोर्टेबिलिटी पात्र %', 'Return Migration %': 'वापसी प्रवास %',
    'Open Vacancies': 'रिक्त पद', 'YoY Change %': 'वार्षिक परिवर्तन %', 'Filled Last Month': 'पिछले माह भरे गए',
    'Avg Days to Fill': 'भरने में औसत दिन', 'Median Offered Wage (₹/mo)': 'प्रस्तावित माध्य वेतन (₹/माह)',
    'Employers Posting': 'पद प्रकाशित करने वाले नियोक्ता', 'Change': 'परिवर्तन', 'Trend': 'प्रवृत्ति',
    'Gap vs Benchmark': 'मानक से अंतर', 'Improving': 'सुधार हो रहा', 'Worsening': 'बिगड़ रहा',
    // report sections
    'Workforce Composition': 'कार्यबल संरचना', 'Formal–Informal Segmentation': 'औपचारिक–अनौपचारिक विभाजन',
    'Education-to-Employment / Skilling Mapping': 'शिक्षा-से-रोज़गार / कौशल मानचित्रण',
    'Income & Wage': 'आय एवं वेतन', 'Migration & Interstate Mobility': 'प्रवास एवं अंतरराज्यीय गतिशीलता',
    'Demand-Side Signals': 'मांग-पक्ष संकेत', 'Available reports': 'उपलब्ध रिपोर्ट',
    'Preview & Download': 'पूर्वावलोकन और डाउनलोड', 'Reporting period': 'रिपोर्टिंग अवधि',
    'Include sections': 'अनुभाग शामिल करें', 'Report type': 'रिपोर्ट प्रकार', 'Format': 'प्रारूप',
    'From': 'से', 'To': 'तक', 'Summary tables': 'सारांश तालिकाएं', 'State breakdown': 'राज्यवार विभाजन',
    'Raw data': 'कच्चा डेटा', 'Monthly': 'मासिक', 'Quarterly': 'त्रैमासिक', 'Run now': 'अभी चलाएं',
    // inline fragments & misc
    'Benchmark:': 'मानक:', '· Last month:': '· पिछला माह:', 'View report & download': 'रिपोर्ट देखें और डाउनलोड करें',
    'vs last month': 'पिछले माह की तुलना में', 'Last ·': 'अंतिम ·', 'wage': 'वेतन', 'Enroll': 'नामांकन करें',
    '100% Verified': '100% सत्यापित', 'years experience': 'वर्ष का अनुभव', '/day': '/दिन',
    'match': 'मेल', 'applicants': 'आवेदक', 'openings ·': 'रिक्तियां ·', 'avg': 'औसत',
    'In-person': 'प्रत्यक्ष', 'Online': 'ऑनलाइन', 'Hybrid': 'मिश्रित', 'Applied': 'आवेदन किया',
    'Profile': 'प्रोफ़ाइल', 'Age': 'आयु', 'New': 'नया', 'Shortlisted': 'चयनित सूची में',
    'Limited Seats': 'सीमित सीटें', 'Safety': 'सुरक्षा', 'My CV': 'मेरा सीवी',
    'Cr covered of ₹': 'करोड़ कवर, कुल ₹', 'Cr allotted': 'करोड़ आवंटित',
    // skills / roles
    'Masonry': 'चिनाई', 'Plastering': 'पलस्तर', 'Scaffolding': 'मचान', 'Tile Work': 'टाइल कार्य',
    'Blueprint Reading': 'नक्शा पठन', 'Concrete Finishing': 'कंक्रीट फिनिशिंग',
    'Construction Supervisor': 'निर्माण पर्यवेक्षक', 'Waterproofing': 'जलरोधन',
    'Structural Repair': 'संरचनात्मक मरम्मत', 'Construction Skills Council': 'निर्माण कौशल परिषद',
    // grievance subjects
    'Maternity benefit delayed': 'मातृत्व लाभ में देरी',
    'e-Shram card renewal pending': 'ई-श्रम कार्ड नवीनीकरण लंबित',
    'UAN activation OTP not received': 'UAN सक्रियण ओटीपी प्राप्त नहीं हुआ',
    'PAN correction request pending': 'पैन सुधार अनुरोध लंबित',
  });
  Object.assign(MR, {
    'Sector': 'क्षेत्र', 'Current Workers': 'सध्याचे कामगार', 'Previous Year Workers': 'गेल्या वर्षीचे कामगार',
    'YoY Growth %': 'वार्षिक वाढ %', 'Formal Share %': 'औपचारिक वाटा %', 'Female Share %': 'महिला वाटा %',
    'Avg Monthly Wage (₹)': 'सरासरी मासिक वेतन (₹)', 'WIN-Verified Workers': 'WIN-सत्यापित कामगार',
    'Employers Registered': 'नोंदणीकृत नियोक्ते', 'Informal Sub-sector': 'असंघटित उप-क्षेत्र',
    'Headcount': 'एकूण संख्या', 'PF Coverage %': 'पीएफ कव्हरेज %', 'ESIC Coverage %': 'ईएसआयसी कव्हरेज %',
    'Avg Daily Wage (₹)': 'सरासरी दैनिक वेतन (₹)', 'WIN-Verified %': 'WIN-सत्यापित %',
    'Social Security Gap %': 'सामाजिक सुरक्षा तुट %', 'Women Share %': 'महिला वाटा %',
    'Graduation Stream': 'पदवी शाखा', 'First-Employment Sector': 'प्रथम रोजगार क्षेत्र',
    'Placed (count)': 'नियुक्त (संख्या)', 'Share of Stream %': 'शाखा वाटा %',
    'Avg Entry Wage (₹/mo)': 'सरासरी प्रारंभिक वेतन (₹/महिना)', 'Skill-Match %': 'कौशल्य-जुळणी %',
    'Median Months to Placement': 'नियुक्तीपर्यंत सरासरी महिने', 'Skill Level': 'कौशल्य स्तर',
    'Median Wage (₹/mo)': 'मध्यक वेतन (₹/महिना)', 'Mean Wage (₹/mo)': 'सरासरी वेतन (₹/महिना)',
    'Origin State': 'मूळ राज्य', 'Destination State': 'गंतव्य राज्य', 'Workers (est.)': 'कामगार (अंदाजे)',
    'Dominant Sector': 'प्रमुख क्षेत्र', 'Peak Season': 'हंगाम', 'Avg Stay (months)': 'सरासरी वास्तव्य (महिने)',
    'Benefit Portability Eligible %': 'लाभ पोर्टेबिलिटी पात्र %', 'Return Migration %': 'परतीचे स्थलांतर %',
    'Open Vacancies': 'रिक्त जागा', 'YoY Change %': 'वार्षिक बदल %', 'Filled Last Month': 'गेल्या महिन्यात भरल्या',
    'Avg Days to Fill': 'भरण्यास सरासरी दिवस', 'Median Offered Wage (₹/mo)': 'देऊ केलेले मध्यक वेतन (₹/महिना)',
    'Employers Posting': 'जागा प्रकाशित करणारे नियोक्ते', 'Change': 'बदल', 'Trend': 'कल',
    'Gap vs Benchmark': 'मानकाशी तुट', 'Improving': 'सुधारत आहे', 'Worsening': 'बिघडत आहे',
    'Workforce Composition': 'कार्यबल रचना', 'Formal–Informal Segmentation': 'औपचारिक–असंघटित विभाजन',
    'Education-to-Employment / Skilling Mapping': 'शिक्षण-ते-रोजगार / कौशल्य मॅपिंग',
    'Income & Wage': 'उत्पन्न व वेतन', 'Migration & Interstate Mobility': 'स्थलांतर व आंतरराज्य गतिशीलता',
    'Demand-Side Signals': 'मागणी-बाजू संकेत', 'Available reports': 'उपलब्ध अहवाल',
    'Preview & Download': 'पूर्वावलोकन आणि डाउनलोड', 'Reporting period': 'अहवाल कालावधी',
    'Include sections': 'विभाग समाविष्ट करा', 'Report type': 'अहवाल प्रकार', 'Format': 'स्वरूप',
    'From': 'पासून', 'To': 'पर्यंत', 'Summary tables': 'सारांश तक्ते', 'State breakdown': 'राज्यनिहाय विभाजन',
    'Raw data': 'कच्चा डेटा', 'Monthly': 'मासिक', 'Quarterly': 'त्रैमासिक', 'Run now': 'आता चालवा',
    'Benchmark:': 'मानक:', '· Last month:': '· गेला महिना:', 'View report & download': 'अहवाल पहा आणि डाउनलोड करा',
    'vs last month': 'गेल्या महिन्याच्या तुलनेत', 'Last ·': 'शेवटचे ·', 'wage': 'वेतन', 'Enroll': 'नोंदणी करा',
    '100% Verified': '100% सत्यापित', 'years experience': 'वर्षांचा अनुभव', '/day': '/दिवस',
    'match': 'जुळणी', 'applicants': 'अर्जदार', 'openings ·': 'रिक्त जागा ·', 'avg': 'सरासरी',
    'In-person': 'प्रत्यक्ष', 'Online': 'ऑनलाइन', 'Hybrid': 'संमिश्र', 'Applied': 'अर्ज केला',
    'Profile': 'प्रोफाइल', 'Age': 'वय', 'New': 'नवीन', 'Shortlisted': 'निवडयादीत',
    'Limited Seats': 'मर्यादित जागा', 'Safety': 'सुरक्षा', 'My CV': 'माझा सीव्ही',
    'Cr covered of ₹': 'कोटी कव्हर, एकूण ₹', 'Cr allotted': 'कोटी वाटप',
    'Masonry': 'गवंडीकाम', 'Plastering': 'गिलावा', 'Scaffolding': 'मचाण', 'Tile Work': 'टाइल काम',
    'Blueprint Reading': 'नकाशा वाचन', 'Concrete Finishing': 'काँक्रीट फिनिशिंग',
    'Construction Supervisor': 'बांधकाम पर्यवेक्षक', 'Waterproofing': 'जलरोधन',
    'Structural Repair': 'संरचनात्मक दुरुस्ती', 'Construction Skills Council': 'बांधकाम कौशल्य परिषद',
    'Maternity benefit delayed': 'मातृत्व लाभास विलंब',
    'e-Shram card renewal pending': 'ई-श्रम कार्ड नूतनीकरण प्रलंबित',
    'UAN activation OTP not received': 'UAN सक्रियकरण ओटीपी मिळाला नाही',
    'PAN correction request pending': 'पॅन दुरुस्ती विनंती प्रलंबित',
  });

  // ---- third pass: settings, help and dashboard vocabulary ----
  Object.assign(HI, {
    'Notifications': 'सूचनाएं', 'Organization': 'संगठन', 'Organisation': 'संगठन', 'Department': 'विभाग',
    'Division': 'प्रभाग', 'Jurisdiction': 'क्षेत्राधिकार', 'Designation ': 'पदनाम ', 'Job Title': 'पद नाम',
    'First Name': 'पहला नाम', 'Last Name': 'अंतिम नाम', 'Email Address': 'ईमेल पता',
    'Official Email': 'आधिकारिक ईमेल', 'Office Location': 'कार्यालय स्थान', 'Company Size': 'कंपनी का आकार',
    'Company & team': 'कंपनी और टीम', 'Account & workspace': 'खाता और कार्यक्षेत्र',
    'Account & workspace settings': 'खाता और कार्यक्षेत्र सेटिंग्स', 'Access & Roles': 'पहुंच और भूमिकाएं',
    'Officers & permissions': 'अधिकारी और अनुमतियां', 'Authorised officers': 'अधिकृत अधिकारी',
    'Nodal Officer': 'नोडल अधिकारी', 'Administration': 'प्रशासन', 'Integrations': 'एकीकरण',
    'Billing': 'बिलिंग', 'Data Policy': 'डेटा नीति', 'Consent compliance': 'सहमति अनुपालन',
    'Alert preferences': 'अलर्ट प्राथमिकताएं', 'Email & push alerts': 'ईमेल और पुश अलर्ट',
    'Manage Profile': 'प्रोफ़ाइल प्रबंधित करें', 'Ministry & jurisdiction': 'मंत्रालय और क्षेत्राधिकार',
    'Ministry / Department': 'मंत्रालय / विभाग', 'Department Information': 'विभाग जानकारी',
    'Department Breakdown': 'विभागवार विभाजन', 'Govt. Access': 'सरकारी पहुंच',
    'All actions audited': 'सभी कार्रवाइयां अंकेक्षित', 'Live sources': 'लाइव स्रोत',
    'Active Sites': 'सक्रिय साइटें', 'Open Positions': 'रिक्त पद', 'Active Positions Overview': 'सक्रिय पदों का अवलोकन',
    'New applicant': 'नया आवेदक', 'Metrics for the last 30 days': 'पिछले 30 दिनों के मापदंड',
    'Avg. first response': 'औसत प्रथम प्रतिक्रिया', 'Open tickets': 'खुले टिकट',
    'Help topics': 'सहायता विषय', 'Frequently Asked Questions': 'अक्सर पूछे जाने वाले प्रश्न',
    'Contact Us': 'हमसे संपर्क करें', 'Contact channels': 'संपर्क माध्यम', 'Email Support': 'ईमेल सहायता',
    'Helpline': 'हेल्पलाइन', 'AI Assistant': 'एआई सहायक', 'Local': 'स्थानीय',
    '7 Days': '7 दिन', '30 Days': '30 दिन', '90 Days': '90 दिन',
    'Governance & department controls.': 'शासन और विभागीय नियंत्रण।',
    'DPDP, retention & audit': 'DPDP, प्रतिधारण और अंकेक्षण', 'DPDP-compliant': 'DPDP-अनुरूप',
    'Available in Grievance Hub': 'शिकायत केंद्र में उपलब्ध',
    'JPG or PNG, up to 5 MB.': 'JPG या PNG, 5 MB तक।',
    'How do I file a grievance?': 'मैं शिकायत कैसे दर्ज करूं?',
    'How do I update my WIN ID details?': 'मैं अपने WIN ID विवरण कैसे अद्यतन करूं?',
    'How do I share my profile with employers?': 'मैं अपनी प्रोफ़ाइल नियोक्ताओं के साथ कैसे साझा करूं?',
    'Can I download my portfolio?': 'क्या मैं अपना पोर्टफोलियो डाउनलोड कर सकता हूं?',
    'How do I check my ESIC/EPFO/E-Shram status?': 'मैं अपनी ESIC/EPFO/ई-श्रम स्थिति कैसे देखूं?',
  });
  Object.assign(MR, {
    'Notifications': 'सूचना', 'Organization': 'संस्था', 'Organisation': 'संस्था', 'Department': 'विभाग',
    'Division': 'विभाग', 'Jurisdiction': 'कार्यक्षेत्र', 'Job Title': 'पदनाम',
    'First Name': 'पहिले नाव', 'Last Name': 'आडनाव', 'Email Address': 'ईमेल पत्ता',
    'Official Email': 'अधिकृत ईमेल', 'Office Location': 'कार्यालय ठिकाण', 'Company Size': 'कंपनीचा आकार',
    'Company & team': 'कंपनी आणि संघ', 'Account & workspace': 'खाते आणि कार्यक्षेत्र',
    'Account & workspace settings': 'खाते आणि कार्यक्षेत्र सेटिंग्ज', 'Access & Roles': 'प्रवेश आणि भूमिका',
    'Officers & permissions': 'अधिकारी आणि परवानग्या', 'Authorised officers': 'अधिकृत अधिकारी',
    'Nodal Officer': 'नोडल अधिकारी', 'Administration': 'प्रशासन', 'Integrations': 'एकत्रीकरण',
    'Billing': 'बिलिंग', 'Data Policy': 'डेटा धोरण', 'Consent compliance': 'संमती अनुपालन',
    'Alert preferences': 'सूचना प्राधान्ये', 'Email & push alerts': 'ईमेल आणि पुश सूचना',
    'Manage Profile': 'प्रोफाइल व्यवस्थापित करा', 'Ministry & jurisdiction': 'मंत्रालय आणि कार्यक्षेत्र',
    'Ministry / Department': 'मंत्रालय / विभाग', 'Department Information': 'विभाग माहिती',
    'Department Breakdown': 'विभागनिहाय विभाजन', 'Govt. Access': 'शासकीय प्रवेश',
    'All actions audited': 'सर्व कृतींचे लेखापरीक्षण', 'Live sources': 'थेट स्रोत',
    'Active Sites': 'सक्रिय साइट', 'Open Positions': 'रिक्त पदे', 'Active Positions Overview': 'सक्रिय पदांचा आढावा',
    'New applicant': 'नवीन अर्जदार', 'Metrics for the last 30 days': 'गेल्या 30 दिवसांचे मापदंड',
    'Avg. first response': 'सरासरी पहिला प्रतिसाद', 'Open tickets': 'खुली तिकिटे',
    'Help topics': 'मदत विषय', 'Frequently Asked Questions': 'वारंवार विचारले जाणारे प्रश्न',
    'Contact Us': 'आमच्याशी संपर्क साधा', 'Contact channels': 'संपर्क माध्यमे', 'Email Support': 'ईमेल सहाय्य',
    'Helpline': 'हेल्पलाइन', 'AI Assistant': 'एआय सहाय्यक', 'Local': 'स्थानिक',
    '7 Days': '7 दिवस', '30 Days': '30 दिवस', '90 Days': '90 दिवस',
    'Governance & department controls.': 'प्रशासन आणि विभागीय नियंत्रणे।',
    'DPDP, retention & audit': 'DPDP, जतन आणि लेखापरीक्षण', 'DPDP-compliant': 'DPDP-अनुरूप',
    'Available in Grievance Hub': 'तक्रार केंद्रात उपलब्ध',
    'JPG or PNG, up to 5 MB.': 'JPG किंवा PNG, 5 MB पर्यंत।',
    'How do I file a grievance?': 'मी तक्रार कशी दाखल करू?',
    'How do I update my WIN ID details?': 'मी माझे WIN ID तपशील कसे अद्ययावत करू?',
    'How do I share my profile with employers?': 'मी माझी प्रोफाइल नियोक्त्यांसोबत कशी सामायिक करू?',
    'Can I download my portfolio?': 'मी माझा पोर्टफोलिओ डाउनलोड करू शकतो का?',
    'How do I check my ESIC/EPFO/E-Shram status?': 'मी माझी ESIC/EPFO/ई-श्रम स्थिती कशी तपासू?',
  });

  // ---- fourth pass: demographics/enrollment/CV/jobs labels ----
  Object.assign(HI, {
    'Age Distribution': 'आयु वितरण', 'Gender Distribution': 'लिंग वितरण', 'Average age': 'औसत आयु',
    'Avg Age': 'औसत आयु', 'Avg Match': 'औसत मेल', 'Male': 'पुरुष', 'Female': 'महिला',
    'Male / Female': 'पुरुष / महिला', 'Male workers': 'पुरुष श्रमिक', 'Female workers': 'महिला श्रमिक',
    'Female participation': 'महिला भागीदारी', 'Gender-wise LFPR': 'लिंग-वार LFPR',
    'Urban': 'शहरी', 'Rural': 'ग्रामीण', 'Urban / Rural': 'शहरी / ग्रामीण', 'Urban Workers': 'शहरी श्रमिक',
    'Rural Workers': 'ग्रामीण श्रमिक', 'Urban vs Rural Split': 'शहरी बनाम ग्रामीण विभाजन',
    'Rural enrollment': 'ग्रामीण नामांकन', 'Total': 'कुल', 'Total Enrolled': 'कुल नामांकित',
    'Total enrolled': 'कुल नामांकित', 'Total enrolled workers': 'कुल नामांकित श्रमिक',
    'Summary': 'सारांश', 'Growth': 'वृद्धि', 'Year': 'वर्ष', 'Years': 'वर्ष',
    'Years of Experience': 'अनुभव के वर्ष', 'Experience': 'अनुभव', 'Identity': 'पहचान', 'Filters': 'फ़िल्टर',
    'Showing': 'दिखा रहे हैं', 'Cumulative': 'संचयी', 'Cumulative Enrollment': 'संचयी नामांकन',
    'Current Month': 'वर्तमान माह', 'All-time': 'सर्वकालिक', 'This financial year': 'इस वित्तीय वर्ष',
    'Up to date': 'अद्यतन', 'Not yet started': 'अभी शुरू नहीं हुआ', 'Awaiting source match': 'स्रोत मेल की प्रतीक्षा',
    'New this month': 'इस माह नया', 'New enrolled': 'नए नामांकित', 'Across all sites': 'सभी साइटों पर',
    'Due within the cycle': 'चक्र के भीतर देय', 'File immediately': 'तुरंत दाखिल करें',
    'Quick Stats': 'त्वरित आंकड़े', 'Quick actions': 'त्वरित कार्रवाई', 'Key Insights': 'मुख्य निष्कर्ष',
    'Add Entry': 'प्रविष्टि जोड़ें', 'Export Data': 'डेटा निर्यात करें', 'Export CV': 'सीवी निर्यात करें',
    'Generate Report': 'रिपोर्ट बनाएं', 'Custom report': 'कस्टम रिपोर्ट', 'Regenerate': 'फिर से बनाएं',
    'Schedule': 'अनुसूची', 'Scheduled': 'अनुसूचित', 'Scheduled reports': 'अनुसूचित रिपोर्ट',
    'Registry reports': 'रजिस्ट्री रिपोर्ट', 'Reports & exports': 'रिपोर्ट और निर्यात',
    'About these reports': 'इन रिपोर्टों के बारे में', 'By Scheme': 'योजनावार', 'By State': 'राज्यवार',
    'Save All Changes': 'सभी परिवर्तन सहेजें', 'Scan to Verify': 'सत्यापन हेतु स्कैन करें',
    'Trust Score': 'विश्वास स्कोर', 'Overall Score': 'कुल स्कोर', 'Work History': 'कार्य इतिहास',
    'Verified work history': 'सत्यापित कार्य इतिहास', 'Verified by Source': 'स्रोत द्वारा सत्यापित',
    'View Complete History': 'पूरा इतिहास देखें', 'Professional Summary': 'व्यावसायिक सारांश',
    'Professional CV': 'व्यावसायिक सीवी', 'CV Preview': 'सीवी पूर्वावलोकन', 'Make my CV': 'मेरा सीवी बनाएं',
    'Level / Qualification': 'स्तर / योग्यता', 'Percentage / Grade': 'प्रतिशत / ग्रेड',
    'School / College': 'विद्यालय / महाविद्यालय', 'Role / Title': 'भूमिका / पद', 'Title / Role': 'पद / भूमिका',
    'Employee Type': 'कर्मचारी प्रकार', 'Prev. Employment': 'पूर्व रोज़गार', 'Matching Jobs': 'मेल खाती नौकरियां',
    'Matching roles': 'मेल खाती भूमिकाएं', 'Job Resources': 'नौकरी संसाधन', 'Job Market Trends': 'नौकरी बाज़ार प्रवृत्तियां',
    'Find jobs near me': 'मेरे पास नौकरियां खोजें', 'Hyperlocal & gig': 'स्थानीय एवं गिग',
    'Courses & guidance': 'पाठ्यक्रम एवं मार्गदर्शन', 'Certification': 'प्रमाणन', 'Interview': 'साक्षात्कार',
    'Gig Workers': 'गिग श्रमिक', 'Gig economy': 'गिग अर्थव्यवस्था', 'Professionals': 'पेशेवर',
    'Formal / Informal': 'औपचारिक / अनौपचारिक', 'Informal coverage': 'अनौपचारिक कवरेज',
    'Unemployment Rate': 'बेरोज़गारी दर', 'Skill-Mismatch Rate': 'कौशल-असंगति दर',
    'Social Security Coverage Rate': 'सामाजिक सुरक्षा कवरेज दर', 'Enrollment Breakdown': 'नामांकन विभाजन',
    'Enrollment & verification': 'नामांकन एवं सत्यापन', 'Monthly Enrollment Trend': 'मासिक नामांकन प्रवृत्ति',
    'Sector Growth': 'क्षेत्रीय वृद्धि', 'Top Sector': 'प्रमुख क्षेत्र', 'States & UTs': 'राज्य एवं केंद्रशासित प्रदेश',
    'Other states & UTs': 'अन्य राज्य एवं केंद्रशासित प्रदेश', 'National dashboard': 'राष्ट्रीय डैशबोर्ड',
    'Explore the registry': 'रजिस्ट्री देखें', 'New Verification': 'नया सत्यापन',
    'Verify pending batch': 'लंबित बैच सत्यापित करें', 'Check eligibility': 'पात्रता जांचें',
    'Govt schemes': 'सरकारी योजनाएं', 'Govt Database': 'सरकारी डेटाबेस', 'Govt. scheme alert': 'सरकारी योजना अलर्ट',
    'Migrant Registration Gap': 'प्रवासी पंजीकरण अंतर', 'Migrant Sector Concentration': 'प्रवासी क्षेत्र संकेंद्रण',
    'Benefit Portability Uptake': 'लाभ पोर्टेबिलिटी अपनाव', 'Employer Hiring Intent': 'नियोक्ता भर्ती मंशा',
    'Verified Income Record': 'सत्यापित आय अभिलेख', 'Organised vs. Unorganised Sector': 'संगठित बनाम असंगठित क्षेत्र',
    'Domestic Work': 'घरेलू कार्य', 'Plumbing': 'नलसाज़ी', 'Tiling': 'टाइलिंग', 'Concrete': 'कंक्रीट',
    'Supervision': 'पर्यवेक्षण', 'Teaching': 'शिक्षण', 'Pipefitting': 'पाइप फिटिंग', 'Renovation': 'नवीकरण',
    'Project Management': 'परियोजना प्रबंधन', 'Mason': 'राजमिस्त्री', 'Senior Mason': 'वरिष्ठ राजमिस्त्री',
    'Mason Foreman': 'राजमिस्त्री फोरमैन', 'Farm Labourer': 'कृषि श्रमिक',
    'Profile Match Score': 'प्रोफ़ाइल मेल स्कोर', 'profile match': 'प्रोफ़ाइल मेल',
    'The shape of India’s workforce.': 'भारत के कार्यबल का स्वरूप।',
    "The shape of India's workforce.": 'भारत के कार्यबल का स्वरूप।',
    'Turn the registry into decisions.': 'रजिस्ट्री को निर्णयों में बदलें।',
    'Worker enrollment across India.': 'भारत भर में श्रमिक नामांकन।',
  });
  Object.assign(MR, {
    'Age Distribution': 'वयोगट वितरण', 'Gender Distribution': 'लिंग वितरण', 'Average age': 'सरासरी वय',
    'Avg Age': 'सरासरी वय', 'Avg Match': 'सरासरी जुळणी', 'Male': 'पुरुष', 'Female': 'महिला',
    'Male / Female': 'पुरुष / महिला', 'Male workers': 'पुरुष कामगार', 'Female workers': 'महिला कामगार',
    'Female participation': 'महिला सहभाग', 'Gender-wise LFPR': 'लिंगनिहाय LFPR',
    'Urban': 'शहरी', 'Rural': 'ग्रामीण', 'Urban / Rural': 'शहरी / ग्रामीण', 'Urban Workers': 'शहरी कामगार',
    'Rural Workers': 'ग्रामीण कामगार', 'Urban vs Rural Split': 'शहरी विरुद्ध ग्रामीण विभाजन',
    'Rural enrollment': 'ग्रामीण नोंदणी', 'Total': 'एकूण', 'Total Enrolled': 'एकूण नोंदणीकृत',
    'Total enrolled': 'एकूण नोंदणीकृत', 'Total enrolled workers': 'एकूण नोंदणीकृत कामगार',
    'Summary': 'सारांश', 'Growth': 'वाढ', 'Year': 'वर्ष', 'Years': 'वर्षे',
    'Years of Experience': 'अनुभवाची वर्षे', 'Experience': 'अनुभव', 'Identity': 'ओळख', 'Filters': 'फिल्टर',
    'Showing': 'दाखवत आहे', 'Cumulative': 'एकत्रित', 'Cumulative Enrollment': 'एकत्रित नोंदणी',
    'Current Month': 'चालू महिना', 'All-time': 'सर्वकाळ', 'This financial year': 'या आर्थिक वर्षात',
    'Up to date': 'अद्ययावत', 'Not yet started': 'अद्याप सुरू नाही', 'Awaiting source match': 'स्रोत जुळणीच्या प्रतीक्षेत',
    'New this month': 'या महिन्यात नवीन', 'New enrolled': 'नवीन नोंदणीकृत', 'Across all sites': 'सर्व साइटवर',
    'Due within the cycle': 'चक्रात देय', 'File immediately': 'तात्काळ दाखल करा',
    'Quick Stats': 'झटपट आकडेवारी', 'Quick actions': 'झटपट कृती', 'Key Insights': 'प्रमुख निष्कर्ष',
    'Add Entry': 'नोंद जोडा', 'Export Data': 'डेटा निर्यात करा', 'Export CV': 'सीव्ही निर्यात करा',
    'Generate Report': 'अहवाल तयार करा', 'Custom report': 'सानुकूल अहवाल', 'Regenerate': 'पुन्हा तयार करा',
    'Schedule': 'वेळापत्रक', 'Scheduled': 'नियोजित', 'Scheduled reports': 'नियोजित अहवाल',
    'Registry reports': 'नोंदवही अहवाल', 'Reports & exports': 'अहवाल आणि निर्यात',
    'About these reports': 'या अहवालांबद्दल', 'By Scheme': 'योजनानिहाय', 'By State': 'राज्यनिहाय',
    'Save All Changes': 'सर्व बदल जतन करा', 'Scan to Verify': 'सत्यापनासाठी स्कॅन करा',
    'Trust Score': 'विश्वास गुण', 'Overall Score': 'एकूण गुण', 'Work History': 'कामाचा इतिहास',
    'Verified work history': 'सत्यापित कामाचा इतिहास', 'Verified by Source': 'स्रोताद्वारे सत्यापित',
    'View Complete History': 'संपूर्ण इतिहास पहा', 'Professional Summary': 'व्यावसायिक सारांश',
    'Professional CV': 'व्यावसायिक सीव्ही', 'CV Preview': 'सीव्ही पूर्वावलोकन', 'Make my CV': 'माझा सीव्ही तयार करा',
    'Level / Qualification': 'स्तर / पात्रता', 'Percentage / Grade': 'टक्केवारी / श्रेणी',
    'School / College': 'शाळा / महाविद्यालय', 'Role / Title': 'भूमिका / पद', 'Title / Role': 'पद / भूमिका',
    'Employee Type': 'कर्मचारी प्रकार', 'Prev. Employment': 'पूर्वीचा रोजगार', 'Matching Jobs': 'जुळणाऱ्या नोकऱ्या',
    'Matching roles': 'जुळणाऱ्या भूमिका', 'Job Resources': 'नोकरी संसाधने', 'Job Market Trends': 'नोकरी बाजार कल',
    'Find jobs near me': 'माझ्या जवळच्या नोकऱ्या शोधा', 'Hyperlocal & gig': 'स्थानिक व गिग',
    'Courses & guidance': 'अभ्यासक्रम व मार्गदर्शन', 'Certification': 'प्रमाणन', 'Interview': 'मुलाखत',
    'Gig Workers': 'गिग कामगार', 'Gig economy': 'गिग अर्थव्यवस्था', 'Professionals': 'व्यावसायिक',
    'Formal / Informal': 'औपचारिक / असंघटित', 'Informal coverage': 'असंघटित कव्हरेज',
    'Unemployment Rate': 'बेरोजगारी दर', 'Skill-Mismatch Rate': 'कौशल्य-विसंगती दर',
    'Social Security Coverage Rate': 'सामाजिक सुरक्षा कव्हरेज दर', 'Enrollment Breakdown': 'नोंदणी विभाजन',
    'Enrollment & verification': 'नोंदणी व सत्यापन', 'Monthly Enrollment Trend': 'मासिक नोंदणी कल',
    'Sector Growth': 'क्षेत्रीय वाढ', 'Top Sector': 'प्रमुख क्षेत्र', 'States & UTs': 'राज्ये व केंद्रशासित प्रदेश',
    'Other states & UTs': 'इतर राज्ये व केंद्रशासित प्रदेश', 'National dashboard': 'राष्ट्रीय डॅशबोर्ड',
    'Explore the registry': 'नोंदवही पहा', 'New Verification': 'नवीन सत्यापन',
    'Verify pending batch': 'प्रलंबित बॅच सत्यापित करा', 'Check eligibility': 'पात्रता तपासा',
    'Govt schemes': 'शासकीय योजना', 'Govt Database': 'शासकीय डेटाबेस', 'Govt. scheme alert': 'शासकीय योजना सूचना',
    'Migrant Registration Gap': 'स्थलांतरित नोंदणी तुट', 'Migrant Sector Concentration': 'स्थलांतरित क्षेत्र संकेंद्रण',
    'Benefit Portability Uptake': 'लाभ पोर्टेबिलिटी स्वीकार', 'Employer Hiring Intent': 'नियोक्ता भरती हेतू',
    'Verified Income Record': 'सत्यापित उत्पन्न अभिलेख', 'Organised vs. Unorganised Sector': 'संघटित विरुद्ध असंघटित क्षेत्र',
    'Domestic Work': 'घरगुती काम', 'Plumbing': 'नळकाम', 'Tiling': 'टायलिंग', 'Concrete': 'काँक्रीट',
    'Supervision': 'पर्यवेक्षण', 'Teaching': 'अध्यापन', 'Pipefitting': 'पाईप फिटिंग', 'Renovation': 'नूतनीकरण',
    'Project Management': 'प्रकल्प व्यवस्थापन', 'Mason': 'गवंडी', 'Senior Mason': 'वरिष्ठ गवंडी',
    'Mason Foreman': 'गवंडी फोरमन', 'Farm Labourer': 'शेतमजूर',
    'Profile Match Score': 'प्रोफाइल जुळणी गुण', 'profile match': 'प्रोफाइल जुळणी',
    'The shape of India’s workforce.': 'भारताच्या कार्यबलाचे स्वरूप।',
    "The shape of India's workforce.": 'भारताच्या कार्यबलाचे स्वरूप।',
    'Turn the registry into decisions.': 'नोंदवहीचे निर्णयांत रूपांतर करा।',
    'Worker enrollment across India.': 'भारतभर कामगार नोंदणी।',
  });

  const DICT = { hi: HI, mr: MR };

  // lower-cased index per language so matching is case-insensitive without
  // losing the curated casing of the source keys.
  const LOWER = {};
  Object.keys(DICT).forEach(l => {
    LOWER[l] = {};
    Object.keys(DICT[l]).forEach(k => { LOWER[l][k.toLowerCase()] = DICT[l][k]; });
  });

  App.t = (s, lang) => {
    const l = lang || App.state.lang || 'en';
    if (l === 'en' || !DICT[l]) return s;
    const key = String(s).replace(/\s+/g, ' ').trim();
    return DICT[l][key] || LOWER[l][key.toLowerCase()] || s;
  };

  const SKIP_TAGS = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, CODE: 1, PRE: 1, SVG: 1, OPTION: 1 };

  // Walks a subtree and replaces each text node whose whole (whitespace-collapsed)
  // content is a dictionary key. Whole-node exact matching means a sentence that
  // isn't in the dictionary is left completely untouched rather than half-translated.
  App.translateTree = (root) => {
    const l = App.state.lang || 'en';
    if (l === 'en' || !DICT[l] || !root) return;
    const d = DICT[l], dl = LOWER[l];

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const p = node.parentNode;
        if (!p || SKIP_TAGS[p.nodeName]) return NodeFilter.FILTER_REJECT;
        // leave monospace/numeric cells alone — those are IDs, amounts, dates
        if (p.classList && (p.classList.contains('mono') || p.classList.contains('num'))) return NodeFilter.FILTER_REJECT;
        return node.nodeValue && node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const nodes = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n);
    nodes.forEach(n => {
      const raw = n.nodeValue;
      const key = raw.replace(/\s+/g, ' ').trim();
      const hit = d[key] || dl[key.toLowerCase()];
      if (!hit) return;
      // preserve the original leading/trailing whitespace so inline layout holds
      const lead = raw.match(/^\s*/)[0], tail = raw.match(/\s*$/)[0];
      n.nodeValue = lead + hit + tail;
    });

    // user-facing attributes
    root.querySelectorAll && root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el => {
      ['placeholder', 'title', 'aria-label'].forEach(a => {
        const v = el.getAttribute(a);
        if (!v) return;
        const t = App.t(v, l);
        if (t !== v) el.setAttribute(a, t);
      });
    });
  };
})();
