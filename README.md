# MINT-	Metrics Intelligence Tool
MINT is a software solution designed to correlate metrics from different software development life cycle in order to provide valuable recommendations to different actors impacting the software development process. MINT considers the different measurements collected by the MEASURE platform as events occurring at runtime.  The correlation is designed as extended finite state machines (EFSMs) allowing to perform Complex Event Processing (CEP) in order to determine the possible actions that can be taken to improve the diverse stages of the software life cycle and thus the global software quality and cost.

Documentation : https://github.com/ersilva/Mint/wiki
## MEASURE platform
The Measure Platform is a web application which allows to collect, calculate, store and visualize measurements by execution of measures defined in SMM (Structured Metrics Metamodel).

The Measure platform is built in the context of Measure ITEA 3 project. The goal of the project is to increase the quality and efficiency as well as to reduce the costs and time-to-market of software engineering in Europe (and the world :-)). By implementing a comprehensive set of tools for automated and continuous measurement, we provide a toolset for future projects to properly measure their impact.

Documentation : https://github.com/ITEA3-Measure/MeasurePlatform/wiki

MINT is integrated into the MEASURE platform through the MEASURE Analysis Platform API, embedded into the platform web application.

**Measure Analysis configuration page**
![](https://www.dropbox.com/s/luluo6n6564291w/config-0.PNG?dl=1)

**Mint configuration page**
![](https://www.dropbox.com/s/o5oo7e5ztxacljc/config-1.PNG?dl=1)

**Mint recommendations**
![](https://www.dropbox.com/s/egx9bptojue2jus/recommendations-1.PNG?dl=1)
