"""
Universal Domain Taxonomy Registry for SkillMirror Career Intelligence Engine.
Supports ALL Engineering and Non-Engineering domains.
"""

DOMAIN_TAXONOMY = {
    "Civil Engineering": {
        "description": "Infrastructure, structural design, construction management, surveying, and environmental systems.",
        "icon": "fa-building-columns",
        "color": "amber",
        "roles": {
            "Structural Engineer": {
                "critical_skills": ["Structural Analysis", "AutoCAD", "STAAD.Pro", "RCC Design"],
                "high_priority": ["Steel Design", "Building Codes (IS 456 / ACI)", "ETABS"],
                "medium_priority": ["Quantity Estimation", "Revit Structure", "Concrete Technology"],
                "optional_skills": ["Dynamo BIM", "FEA Modeling", "Prestressed Concrete"],
                "projects": [
                    "G+5 Residential Building Structural Design on STAAD.Pro",
                    "RC Retaining Wall & Footing Design Calculations",
                    "Steel Truss Industrial Shed Design per Building Codes"
                ],
                "certifications": ["STAAD.Pro Certified Engineer", "AutoCAD Building Design Professional", "NPTEL Structural Analysis"]
            },
            "Site Engineer": {
                "critical_skills": ["Construction Supervision", "Quality Control", "Surveying", "Building Codes"],
                "high_priority": ["Quantity Estimation", "Bar Bending Schedule (BBS)", "AutoCAD"],
                "medium_priority": ["Concrete Mix Design", "Safety Protocols (OSHA/IS)", "Primavera P6"],
                "optional_skills": ["Total Station Operation", "Drone Surveying"],
                "projects": [
                    "Construction Site Quality Audit & BBS Report",
                    "Topographic Surveying & Land Layout Mapping"
                ],
                "certifications": ["Certified Construction Manager (CCM)", "Safety Officer Certification (OSHA)"]
            },
            "Quantity Surveyor": {
                "critical_skills": ["Bill of Quantities (BOQ)", "Quantity Estimation", "Cost Estimation", "Contract Management"],
                "high_priority": ["MS Excel (Advanced)", "AutoCAD", "PlanSwift"],
                "medium_priority": ["FIDIC Contracts", "Valuation", "Tendering Process"],
                "optional_skills": ["BIM Quantity Extraction", "CostX"],
                "projects": ["Comprehensive BOQ & Cost Estimation for Commercial Complex", "Construction Contract Tender Document Preparation"],
                "certifications": ["RICS Quantity Surveying Certification", "Certified Cost Professional (CCP)"]
            },
            "BIM Engineer": {
                "critical_skills": ["Autodesk Revit Architecture/Structure", "BIM Modeling", "Clash Detection", "Navisworks"],
                "high_priority": ["AutoCAD", "3D Coordination", "LOD Standards"],
                "medium_priority": ["Dynamo for Revit", "IFC Interoperability", "BIM 360"],
                "optional_skills": ["Point Cloud to BIM", "Parametric Modeling"],
                "projects": ["Multi-Discipline 3D BIM Model with Clash Detection Report", "4D Construction Phasing Simulation"],
                "certifications": ["Autodesk Certified Professional: Revit", "BIM Management Certification"]
            }
        }
    },
    "Mechanical Engineering": {
        "description": "CAD/CAM design, thermo-fluids, manufacturing automation, robotics, and material engineering.",
        "icon": "fa-gears",
        "color": "orange",
        "roles": {
            "Mechanical Design Engineer": {
                "critical_skills": ["SolidWorks", "AutoCAD", "GD&T", "Machine Design"],
                "high_priority": ["CATIA", "Finite Element Analysis (FEA)", "Ansys Mechanical"],
                "medium_priority": ["Material Selection", "DFMA (Design for Mfg & Assembly)", "Kinematics"],
                "optional_skills": ["Autodesk Inventor", "Reverse Engineering", "Rhino 3D"],
                "projects": ["3D CAD Model & FEA Stress Analysis of Gearbox Component", "Sheet Metal Enclosure Design with GD&T Drawings"],
                "certifications": ["Certified SolidWorks Associate (CSWA/CSWP)", "Ansys Structural Professional"]
            },
            "Manufacturing Engineer": {
                "critical_skills": ["CNC Machining", "CAM Programming (Mastercam)", "Manufacturing Processes", "Tooling Design"],
                "high_priority": ["Process Planning", "Quality Control (SPC)", "Lean Manufacturing"],
                "medium_priority": ["Six Sigma", "Jig & Fixture Design", "Supply Chain Basics"],
                "optional_skills": ["Additive Manufacturing / 3D Printing", "Robotic Cell Layout"],
                "projects": ["CNC G-Code Optimization for Precision Shaft Component", "Assembly Line Bottleneck Reduction & Process Flow Design"],
                "certifications": ["Six Sigma Green Belt", "Certified Manufacturing Engineer (CMfgE)"]
            },
            "HVAC Engineer": {
                "critical_skills": ["Heat Load Calculation", "HAP (Hour Analysis Program)", "Duct Design", "HVAC Systems"],
                "high_priority": ["AutoCAD HVAC", "Revit MEP", "Psychrometrics"],
                "medium_priority": ["ASHRAE Standards", "Chillers & AHU Selection", "Energy Simulation"],
                "optional_skills": ["CFD Airflow Simulation", "Building Management Systems (BMS)"],
                "projects": ["Centralized Air Conditioning Heat Load & Duct Sizing Design for Hospital", "Cleanroom Ventilation System Layout"],
                "certifications": ["ASHRAE Certified HVAC Designer (CHD)", "Revit MEP Professional"]
            }
        }
    },
    "ECE / EEE": {
        "description": "Embedded firmware, VLSI microelectronics, IoT, power electronics, and wireless communication.",
        "icon": "fa-microchip",
        "color": "cyan",
        "roles": {
            "Embedded Systems Engineer": {
                "critical_skills": ["Embedded C / C++", "Microcontrollers (STM32 / ESP32)", "UART/SPI/I2C Protocols", "GPIO & Timers"],
                "high_priority": ["RTOS (FreeRTOS)", "PCB Layout Design (KiCAD / Altium)", "Oscilloscope & Logic Analyzer"],
                "medium_priority": ["Bare-metal Firmware", "Embedded Linux", "Git Version Control"],
                "optional_skills": ["BLE / Zigbee Wireless Protocols", "ARM Cortex Architecture"],
                "projects": ["FreeRTOS-based Smart Environmental Monitoring System on STM32", "Custom 2-Layer PCB Design for ESP32 Sensor Node"],
                "certifications": ["ARM Certified Engineer", "Embedded Systems Diploma"]
            },
            "VLSI Design Engineer": {
                "critical_skills": ["Verilog / SystemVerilog", "Digital Design Fundamentals", "FPGA Prototyping (Vivado)", "ASIC Flow"],
                "high_priority": ["Static Timing Analysis (STA)", "CMOS VLSI Design", "ModelSim / QuestaSim"],
                "medium_priority": ["UVM Verification", "Synopsys Design Compiler", "VLSI Testing"],
                "optional_skills": ["Analog Circuit Design", "Cadence Virtuoso"],
                "projects": ["RISC-V 32-bit CPU Core Design & Simulation in Verilog", "UART Transmitter/Receiver Implementation on Xilinx FPGA"],
                "certifications": ["Certified VLSI Design Engineer", "SystemVerilog Verification Certificate"]
            },
            "IoT Engineer": {
                "critical_skills": ["Embedded C / Python", "MQTT / HTTP Protocols", "ESP32 / Raspberry Pi", "Sensors & Actuators"],
                "high_priority": ["Cloud IoT Gateways (AWS IoT / ThingsBoard)", "PCB Layout", "Wireless Mesh Networks"],
                "medium_priority": ["Node-RED", "Edge AI / TinyML", "Cybersecurity in IoT"],
                "optional_skills": ["LoRaWAN Integration", "Industrial Automation (PLC)"],
                "projects": ["Industrial IoT Asset Tracking System with Cloud Dashboard", "Energy Consumption Telemetry System via LoRaWAN"],
                "certifications": ["AWS Certified Alexa Developer / IoT Specialist", "Certified IoT Developer"]
            }
        }
    },
    "Computer Science / IT": {
        "description": "Software engineering, cloud architecture, artificial intelligence, data platforms, and cybersecurity.",
        "icon": "fa-laptop-code",
        "color": "indigo",
        "roles": {
            "Software Developer": {
                "critical_skills": ["Programming (Java / Python / JS)", "Data Structures & Algorithms", "Git & GitHub", "REST APIs"],
                "high_priority": ["Relational Databases (SQL)", "Web Frameworks (React / Node / Django)", "System Architecture"],
                "medium_priority": ["Docker Containerization", "Unit Testing", "CI/CD Pipelines"],
                "optional_skills": ["Kubernetes", "GraphQL", "Cloud Deployment"],
                "projects": ["Full-Stack Enterprise Web Application with Auth & DB", "Microservices Micro-banking REST API"],
                "certifications": ["AWS Certified Developer", "Oracle Certified Java SE Programmer"]
            },
            "Data Scientist / AI Engineer": {
                "critical_skills": ["Python", "NumPy & Pandas", "SQL & Database Queries", "Machine Learning (Scikit-Learn)"],
                "high_priority": ["Deep Learning (TensorFlow / PyTorch)", "Statistics & Probability", "Data Visualization"],
                "medium_priority": ["Feature Engineering", "Model Deployment (FastAPI/Flask)", "NLP / LLMs"],
                "optional_skills": ["MLOps", "Spark Big Data"],
                "projects": ["End-to-End Predictive Analytics Pipeline for Customer Churn", "Fine-Tuned LLM RAG Application for Domain QA"],
                "certifications": ["TensorFlow Developer Certificate", "AWS Certified Machine Learning Specialist"]
            },
            "Cybersecurity Analyst": {
                "critical_skills": ["Network Security Fundamentals", "Linux Command Line", "Wireshark Packet Analysis", "Vulnerability Assessment"],
                "high_priority": ["SIEM Tools (Splunk / QRadar)", "Penetration Testing (Metasploit)", "Ethical Hacking"],
                "medium_priority": ["Firewall & IDS/IPS Configuration", "Incident Response", "Python Security Scripting"],
                "optional_skills": ["Reverse Engineering", "Cloud Security"],
                "projects": ["Automated Vulnerability Scanner & Incident Response Playbook", "Network Traffic Anomaly Detection System"],
                "certifications": ["CompTIA Security+", "Certified Ethical Hacker (CEH)"]
            }
        }
    },
    "Automobile Engineering": {
        "description": "Vehicle design, automotive electronics, powertrain engineering, and EV battery systems.",
        "icon": "fa-car",
        "color": "red",
        "roles": {
            "Automotive Design Engineer": {
                "critical_skills": ["CATIA V5 / SolidWorks", "Automotive Chassis & Body Design", "GD&T", "Vehicle Dynamics"],
                "high_priority": ["Crash & Crashworthiness Analysis (Ansys / LS-DYNA)", "Surface Modeling", "DFMA"],
                "medium_priority": ["Material Selection", "Aerodynamics CFD", "AutoCAD"],
                "optional_skills": ["NVH (Noise, Vibration, Harshness)", "Clay Modeling Basics"],
                "projects": ["Automobile Suspension System CAD Model & Kinematics Simulation", "Aerodynamic Drag Reduction Body Styling Design"],
                "certifications": ["CATIA Certified Automotive Surface Designer", "Ansys Crash Analysis Certificate"]
            },
            "EV Systems Engineer": {
                "critical_skills": ["Battery Management System (BMS)", "Electric Motor Drives", "MATLAB / Simulink", "Power Electronics"],
                "high_priority": ["Thermal Management Systems", "CAN Bus Communication Protocol", "EV Powertrain Simulation"],
                "medium_priority": ["Embedded C for Automotive (AUTOSAR)", "High Voltage Safety", "Battery Chemistry"],
                "optional_skills": ["Hardware-in-the-Loop (HIL) Testing", "Regenerative Braking"],
                "projects": ["MATLAB Simulink Model of Li-ion Battery Management System", "CAN Bus Telemetry Interface for Electric Scooter"],
                "certifications": ["Certified Electric Vehicle Engineer", "MATLAB & Simulink Automotive Professional"]
            }
        }
    },
    "Chemical Engineering": {
        "description": "Process design, chemical plant simulation, reaction kinetics, safety systems, and polymer technology.",
        "icon": "fa-flask-vial",
        "color": "purple",
        "roles": {
            "Chemical Process Engineer": {
                "critical_skills": ["Process Simulation (ASPEN Plus / HYSYS)", "P&ID & PFD Diagrams", "Heat Transfer & Fluid Flow", "Unit Operations"],
                "high_priority": ["Distillation Column Design", "Mass Transfer Calculations", "Process Safety (HAZOP)"],
                "medium_priority": ["Control Valve & Pump Sizing", "Economic Evaluation", "MATLAB Process Modeling"],
                "optional_skills": ["CFD for Chemical Reactors", "PINCH Technology"],
                "projects": ["ASPEN Plus Simulation of Bioethanol Distillation Plant", "HAZOP Safety Analysis & P&ID Drawing for Refinery Unit"],
                "certifications": ["ASPEN Certified User", "AIChE Process Safety Certificate"]
            }
        }
    },
    "Biotechnology / Bioengineering": {
        "description": "Genomics, computational biology, bioprocess optimization, downstream processing, and clinical research.",
        "icon": "fa-dna",
        "color": "emerald",
        "roles": {
            "Bioinformatician": {
                "critical_skills": ["Python / R for Bioinformatics", "NGS Data Analysis", "BLAST / Biopython", "Linux CLI"],
                "high_priority": ["Genomics & Transcriptomics", "Biostatistical Analysis", "Molecular Docking (AutoDock)"],
                "medium_priority": ["SQL Databases", "PyMOL Visualization", "Workflow Managers (Nextflow)"],
                "optional_skills": ["Machine Learning for Protein Structure Prediction", "R Shiny Dashboards"],
                "projects": ["RNA-Seq Differential Gene Expression Pipeline", "Structure-Based Virtual Drug Screening Campaign"],
                "certifications": ["Certified Bioinformatics Specialist", "NPTEL Computational Biology"]
            },
            "Bioprocess Engineer": {
                "critical_skills": ["Fermentation Technology", "Bioreactor Operation", "Downstream Processing", "cGMP Compliance"],
                "high_priority": ["Mass & Energy Balance", "Sterilization Protocols", "Scale-Up Calculations"],
                "medium_priority": ["HPLC & Chromatography", "Quality Control (GLP)", "Process Validation"],
                "optional_skills": ["PAT (Process Analytical Technology)", "Design of Experiments (DoE)"],
                "projects": ["Optimization of Recombinant Protein Expression in Fermenter", "Downstream Chromatography Purification Protocol"],
                "certifications": ["cGMP Professional Certification", "Certified Quality Auditor (CQA)"]
            }
        }
    },
    "Agriculture & Agribusiness": {
        "description": "Precision agriculture, GIS remote sensing, smart irrigation, crop protection, and agribusiness.",
        "icon": "fa-seedling",
        "color": "green",
        "roles": {
            "Ag-Tech Specialist / Agricultural Engineer": {
                "critical_skills": ["Precision Farming Tools", "GIS & Remote Sensing (QGIS)", "Irrigation Engineering", "Soil Science Basics"],
                "high_priority": ["IoT Sensors for Soil", "Drone Mapping", "Data Analysis (Excel/Python)"],
                "medium_priority": ["Farm Machinery Operation", "Post-Harvest Technology", "Sustainable Ag Practices"],
                "optional_skills": ["Hydroponic System Design", "Agribusiness Supply Chain"],
                "projects": ["IoT Smart Irrigation & Soil Nutrient Monitoring System", "GIS Crop Yield Mapping & Health Assessment"],
                "certifications": ["QGIS Professional Certificate", "Certified Precision Agriculture Specialist"]
            }
        }
    },
    "Architecture & Urban Planning": {
        "description": "Architectural drafting, 3D spatial rendering, urban master planning, building bye-laws, and BIM.",
        "icon": "fa-drafting-compass",
        "color": "pink",
        "roles": {
            "Architectural Designer": {
                "critical_skills": ["Autodesk AutoCAD", "Sketchup / Rhino 3D", "Revit Architecture", "Architectural Rendering (V-Ray / Lumion)"],
                "high_priority": ["Building Bye-Laws", "Working Drawings / Detailing", "Photoshop / Illustrator"],
                "medium_priority": ["Sustainable Architecture (LEED)", "Physical Model Making", "Site Planning"],
                "optional_skills": ["Grasshopper Parametric Design", "BIM 360"],
                "projects": ["Sustainable Mixed-Use High-Rise Architectural Blueprint & 3D Render", "Urban Community Park Landscape Master Plan"],
                "certifications": ["Council of Architecture (COA) Registration", "LEED Green Associate (LEED GA)"]
            }
        }
    },
    "Commerce, Finance & Management": {
        "description": "Financial analytics, corporate valuation, business analysis, accounting, and strategic consulting.",
        "icon": "fa-chart-pie",
        "color": "blue",
        "roles": {
            "Financial Analyst": {
                "critical_skills": ["Financial Modeling (Excel)", "Financial Statement Analysis", "Corporate Finance", "Valuation (DCF)"],
                "high_priority": ["Power BI / Tableau", "SQL for Finance", "Bloomberg / Capital IQ Basics"],
                "medium_priority": ["Python / R for Finance", "Accounting Principles", "Risk Management"],
                "optional_skills": ["VBA & Excel Macros", "Fintech API Integration"],
                "projects": ["Three-Statement Financial Model & DCF Valuation of Listed Tech Company", "Interactive Executive Financial Dashboard on Power BI"],
                "certifications": ["CFA Charter (Level 1/2)", "Certified Financial Modeling & Valuation Analyst (FMVA)"]
            },
            "Business Analyst": {
                "critical_skills": ["Business Requirement Documentation (BRD/FRD)", "SQL Data Extraction", "Process Mapping (Visio/BPMN)", "Data Visualization (Tableau/Power BI)"],
                "high_priority": ["Excel Advanced", "Agile & Scrum Methodologies", "Stakeholder Management"],
                "medium_priority": ["User Story Writing (Jira)", "Python Data Cleaning", "Gap Analysis"],
                "optional_skills": ["Salesforce CRM Basics", "Prototyping (Figma)"],
                "projects": ["End-to-End E-Commerce Process Automation BRD & Wireframe Spec", "Retail Sales Performance Analytics Dashboard"],
                "certifications": ["CBAP / ECBA (IIBA)", "PMI Professional in Business Analysis (PMI-PBA)"]
            }
        }
    }
}


def get_available_domains():
    """Returns all supported domain names and metadata."""
    domains = []
    for d_name, meta in DOMAIN_TAXONOMY.items():
        domains.append({
            "name": d_name,
            "description": meta["description"],
            "icon": meta["icon"],
            "color": meta["color"],
            "roles": list(meta["roles"].keys())
        })
    return domains


def get_domain_roles(domain_name: str):
    """Returns roles under a specific domain or all roles."""
    if domain_name in DOMAIN_TAXONOMY:
        return list(DOMAIN_TAXONOMY[domain_name]["roles"].keys())
    
    # Fallback to all roles
    all_roles = []
    for meta in DOMAIN_TAXONOMY.values():
        all_roles.extend(meta["roles"].keys())
    return all_roles


def get_role_taxonomy(domain_name: str, target_role: str):
    """Retrieves taxonomy for a given domain and role."""
    # 1. Exact domain match
    if domain_name in DOMAIN_TAXONOMY:
        roles = DOMAIN_TAXONOMY[domain_name]["roles"]
        if target_role in roles:
            return roles[target_role]
        # Partial role match
        for r_title, r_data in roles.items():
            if target_role.lower() in r_title.lower() or r_title.lower() in target_role.lower():
                return r_data
                
    # 2. Search across all domains
    for d_name, d_meta in DOMAIN_TAXONOMY.items():
        for r_title, r_data in d_meta["roles"].items():
            if target_role.lower() in r_title.lower() or r_title.lower() in target_role.lower():
                return r_data

    # 3. Default structured fallback
    return {
        "critical_skills": ["Domain Fundamentals", "Industry Software Tools", "Project Planning"],
        "high_priority": ["Technical Calculations", "Quality Standards & Codes", "Data Analysis"],
        "medium_priority": ["Documentation", "Team Collaboration", "Problem Solving"],
        "optional_skills": ["Advanced Specialization", "Management Tools"],
        "projects": [f"Practical {target_role} Case Study & Field Implementation", f"End-to-End {target_role} Design Project"],
        "certifications": [f"Professional {target_role} Certification", "Industry Standard Specialist"]
    }
