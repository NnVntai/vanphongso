// StepOne.jsx
import api from "@/config";
// WizardWithStepper.jsx
import React, {useEffect, useState} from "react";
import ShowDate from "../../components/Notification/ShowDateTest.jsx";

import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
} from "@mui/material";



// eslint-disable-next-line no-unused-vars
function StepOne({year, selectedReports,month,week,quarter}) {

    useEffect(() => {

    }, []);
    return (
        <ShowDate api={api} year={year} month={month} week={week} quarter={quarter}
                  // notification={formData.notification}
                  onSelectChange={selectedReports }
        ></ShowDate>
    );
}


export default StepOne;
