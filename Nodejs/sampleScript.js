"use strict";
const appName = "Dayforce";
const integrationName = "GHR Candidates to Dayforce Employee Onboarding";
const RUN_ID = meta.runId;
const TIMESTAMP = new Date().toString();
const ORCH_ID = meta.orchestrationId || "GHR to Dayforce";
const ORCH_NAME = meta.orchestrationName || "GHR to Dayforce";
const LOG_ID = meta.orchestrationLogId;
/**
 * Makes an API call to a specified Dayforce operation with retry logic for rate limiting.
 *
 * This function dynamically calls the appropriate Dayforce API operation using the provided
 * `operationId`, passing in the given `options`. It logs the response and handles rate limiting
 * by retrying the request if a 429 status code is encountered. Retries are attempted up to the
 * specified `retry` count, with a pause determined by the `Retry-After` header or a default delay.
 *
 * @async
 * @function
 * @param {string} operationId - The key corresponding to the specific API method on the `dayforce` object.
 * @param {Object} options - The options object to pass to the Dayforce API method, including parameters like headers, body, and query strings.
 * @param {number} [retry=3] - The number of retry attempts allowed in case of rate-limiting (HTTP 429).
 * @returns {Promise<Object|undefined>} - The `content` property from the API response if available, or `undefined` if all retries are exhausted.
 * @throws {Error|string} - Throws an error if the API call fails with an error other than 429, or if retries are exhausted.
 */
const dayforceCallAPI = async (operationId, options, retry = 3) => {
    try {
        let response = await dayforce[operationId](options);
        log.info(`dayforce api call response with operationId : ${operationId}  ${JSON.stringify(response)}`);
        if (response?.content) {
            return response.content;
        } else if (response?.statusCode == "429" || response?.error?.statusCode == "429") {
            let delay = response?.headers?.["retry-after"] ? +response?.headers?.["retry-after"] + 1000 : 2000;
            await utils.pause(delay);
            if (retry > 0) {
                return dayforceCallAPI(operationId, options, retry - 1);
            };
        } else if (response?.error) {
            // throw `dayforce error on executing ${operationId}: ${response.error}`;
            return response;
        }
    } catch (error) {
        throw error;
    }
};
       /**
 * Displays configuration settings in a formatted table in the logs
 * @param {Object} preferences - Object containing configuration key-value pairs
 */
function printPreferences(preferences) {
    try {
        if (!preferences || typeof preferences !== "object") {
            log.warn("No valid preferences object provided to printPreferences.");
            return;
        }

        const entries = Object.entries(preferences);

        // Calculate the longest key and value lengths
        const maxKeyLength = Math.max(...entries.map(([key]) => key.length));
        const maxValLength = Math.max(...entries.map(([, val]) => (val?.toString()?.length || 0)));
        const keyColWidth = Math.min(maxKeyLength, 40);
        const valColWidth = Math.min(maxValLength, 50);

        const totalWidth = keyColWidth + valColWidth + 7;
        const separator = "+" + "-".repeat(keyColWidth + 2) + "+" + "-".repeat(valColWidth + 2) + "+";

        // Print table header box
        log.info("-".repeat(totalWidth));
        const header = "Preference Values";
        const headerPadding = totalWidth - header.length - 2; // account for | and spacing
        const leftPad = Math.floor(headerPadding / 2);
        const rightPad = headerPadding - leftPad;
        log.info(`|${" ".repeat(leftPad)}${header}${" ".repeat(rightPad)}|`);
        log.info(separator);

        // Print preference rows
        for (const [key, value] of entries) {
            const formattedKey = key.padEnd(keyColWidth);
            const formattedVal = (value !== undefined && value !== null ? String(value) : "(not set)").padEnd(valColWidth);
            log.info(`| ${formattedKey} | ${formattedVal} |`);
        }

        log.info("-".repeat(totalWidth));
    } catch (error) {
        log.error(`Failed to print configuration settings: ${error.message || error}`);
    }
}

/**
 * Converts a given input date to the destination format: "YYYY-MM-DDT00:00:00Z".
 *
 * If the input is falsy (e.g., `null`, `undefined`, or empty), it returns `null`.
 * Otherwise, it parses the date and constructs a UTC date string with zeroed time.
 *
 * @function
 * @param {string|Date} inputDate - The input date string or `Date` object to convert.
 * @returns {string|null} - The formatted date string in "YYYY-MM-DDT00:00:00Z" format, or `null` if no input is provided.
 */
const convertDateToDestinationFormat = (inputDate) => {
    if (!inputDate) {
        return null;
    }
    const dateObj = new Date(inputDate);
    return dateObj.toISOString();

    // Extract the components (year, month, and day)
    // const year = dateObj.getUTCFullYear();
    // const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    // const day = String(dateObj.getUTCDate()).padStart(2, '0');

    // Construct the output string in "YYYY-MM-DDT00:00:00" format
    // return `${year}-${month}-${day}T00:00:00Z`;
};

/**
 * Converts a human-readable employment type string into a standardized code.
 *
 * @function
 * @param {string} type - The employment type (e.g., "Part-time" or "Full-time").
 * @returns {string} - Returns `"PT"` for "Part-time", and `"FT"` for any other value (defaulting to "Full-time").
 *
 * @example
 * getEmploymentType("Part-time"); // "PT"
 * getEmploymentType("Full-time"); // "FT"
 */
const getEmploymentType = (type) => {
    if (type === "Part-time") {
        return "PT";
    } else {
        return "FT";
    }
}

/**
 * Maps data from a Greenhouse application payload to a destination user object dayforce
 * formatted for use in an HCM or payroll system like Dayforce.
 *
 * This function handles transformation of fields such as name, hire date,
 * job details, compensation, contact information, and role assignment.
 * It uses default fallbacks where data is missing and logs the final mapped output.
 *
 * @function
 * @param {Object} greenhousePayload - The incoming payload from Greenhouse Webhook.
 * @param {Object} greenhousePayload.payload.application - Application object containing candidate, job, and offer.
 * @param {Object} destinationUser - The target object that will be populated with transformed data.
 *
 * @returns {void} This function mutates the `destinationUser` object in place; it does not return a value.
 *
 * @example
 * const destinationUser = {};
 * mapSourceToDestination(greenhousePayload, destinationUser);
 * // destinationUser is now populated with mapped fields
 *
 * @notes
 * - Department, job, and location XRefCodes are currently hardcoded and may require dynamic mapping.
 * - Role assignment uses a static `"HR Admin"` XRefCode.
 * - Defaults are applied for base rates, gender, hire/start dates, and fallback values if source fields are missing.
 */
const mapSourceToDestination = async(greenhousePayload, destinationUser) => {
    try {
        const candidate = greenhousePayload?.payload?.application?.candidate || {};
        const job = greenhousePayload?.payload?.application?.job || {};
        const offer = greenhousePayload?.payload?.application?.offer || {};
        const customFields = candidate?.custom_fields || {};
        const jobCustomFields = job?.custom_fields || {};
        const offerCustomFields = offer?.custom_fields || {};
        let officeLocation = job?.offices?.[0]?.location?.toLowerCase();
        if(officeLocation.includes("india")){
            officeLocation = "india"
        }
        const employmentType = jobCustomFields?.employment_type?.value?.toLowerCase() || offerCustomFields?.employment_type?.value?.toLowerCase();
        let inputPhoneNumber = candidate.phone_numbers.find(ele => ele.type === "work")?.value;
        // managerEmail = customFields?.buddy_manager___?.value?.email || "";

        destinationUser.xRefCode = candidate.id || candidate?.custom_fields?.dayforce_employee_id?.value;
        // destinationUser.EmployeeNumber = candidate.external_id || "";
        destinationUser.FirstName = candidate?.first_name || "";
        destinationUser.LastName = candidate?.last_name || candidate?.preferred_name;
        destinationUser.BirthDate = convertDateToDestinationFormat(candidate?.custom_fields?.date_of_birth?.value) || "1969-06-23T00:00:00";
        destinationUser.HireDate = offer?.starts_at || "";
        destinationUser.Gender =  employeeGender[candidate?.custom_fields?.gender?.value] || "" ;
        destinationUser.WorkAssignments = {
            "Items": [
                {
                    "Position": {
                        "Department": {
                            "XRefCode":  departmentPositionXrefCodes[job?.departments[0]?.name] || ""
                        },
                        "Job": {
                            "XRefCode":  jobPositionXrefCodes[candidate?.title] || ""
                        }
                    },
                    "Location": {
                        "XRefCode": departmentLocationXrefCode
                    },
                    "EffectiveStart": convertDateToDestinationFormat(offer?.starts_at) || "",
                    "IsPrimary": true,
                    "BusinessTitle": customFields?.job_title?.value || candidate?.title || "Production Oversight Manager"
                }
            ]
        };
        destinationUser.EmploymentStatuses = {
            "Items": [
                {
                    "EffectiveStart": convertDateToDestinationFormat(offer?.starts_at) || "",
                    "EmploymentStatus": {
                        "XRefCode": "ACTIVE"
                    },
                    "PayType": {
                        "XRefCode": payType[employmentType]
                    },
                    "PayClass": {
                        "XRefCode": getEmploymentType(job?.custom_fields?.employment_type?.value)
                    },
                    "PayGroup": {
                        "XRefCode": payGroup[officeLocation]
                    },
                    "BaseRate": candidate?.custom_fields?.base_pay?.value
                }
            ]
        }
        destinationUser.Contacts = {
            "Items": [
                {
                    "ContactInformationType": {
                        "ContactInformationTypeGroup": {
                            "XRefCode": "ElectronicAddress"
                        },
                        "XRefCode": "BusinessEmail"
                    },
                    "ElectronicAddress": candidate.email_addresses.find(ele => ele.type === "work")?.value || candidate.email_addresses.find(ele => ele.type === "personal")?.value,
                    "IsPreferredContactMethod": true,
                    "EffectiveStart": offer?.starts_at || new Date().toISOString()
                },
                {
                    "ContactInformationType": {
                        "ContactInformationTypeGroup": { "XRefCode": "Phone" },
                        "XRefCode": "BusinessMobile"
                    },
                    "Country": {
                        "XRefCode": await getCountryXrefCode(inputPhoneNumber)
                    },
                    "EffectiveStart": new Date().toISOString(),
                    "ContactNumber": candidate.phone_numbers.find(ele => ele.type === "work")?.value,
                    "IsPreferredContactMethod": true,
                }
            ]
        };

        destinationUser.SocialSecurityNumber = candidate?.custom_fields?.social_security_number?.value  || offer?.id;
        destinationUser.Culture =  {
            "XRefCode": dayforceCultureValue,
        },
        destinationUser.Roles = {
            "Items": [
                {
                    "IsDefault": true,
                    "Role": {
                        "XRefCode": newEmployeeRoles[0]
                    },
                    "EffectiveStart": offer?.starts_at || new Date().toISOString()
                }
            ]
        }
        // log.info(`destination payload after mapping ${JSON.stringify(destinationUser)}`);
    } catch (error) {
        log.info(`error in mapping destinaion ${error}`);
    }

    // return destinationUser;

}


async function getCountryXrefCode(inputPhoneNumber) {
    try {
        let phoneNumberDetails = await dayforceCallAPI("extractPhoneNumberMetadata", {
            phoneNumber: inputPhoneNumber
        });
        log.info(`1111111111111111phoneNumberDetails ${JSON.stringify(phoneNumberDetails)}`);
        if (phoneNumberDetails?.valid) {
            let countryCodeXref = phoneNumberDetails?.alpha3Code;
            return countryCodeXref;
        } else {
            throw new Error("Given phoneNumber is invalid , please provide valid phone number with country code")

        }
    } catch(error){
        log.info(`Given phoneNumber is invalid , please provide valid phone number with country code`);
        if (isSendMail) {
            const subject = `Given phoneNumber is invalid`;
            let body = `Given phoneNumber ${inputPhoneNumber} is invalid, please provide valid phone number with country code`;
            body = formatEmail(body, {});
            log.info(`Email Body: ${JSON.stringify(body)}`);
            // Attempt to send email
            const emailToSend = Array.isArray(adminEmail) ? adminEmail.join(",") : adminEmail;
            log.info(`Sending Given phoneNumber is invalid ${emailToSend} for ${appName}`);
            const emailResponse = await utils.sendEmail(emailToSend, subject, body);
            log.info(`Admin email notification sent successfully.`);
        }
        return error;
    }

}

const getPayType = (employmentType) => {
    let payType = "HOURLY";
    if (employmentType === "full-time" || employmentType === "part-time") {
        payType = "SALARIED";
    } else if (employmentType === "contractor") {
        payType = "CONTRACT";
    } else if (employmentType === "commission") {
        payType = "COMMISSION";
    }
    return payType;
}

const getPayGroup = (officeLocation) => {
    let payGroup = "USBiWeekly";

    if (officeLocation?.includes("india")) {
        payGroup = "INMonthly";
    } else if (officeLocation?.includes("united kingdom")) {
        payGroup = "UKWeekly";
    } else if (officeLocation?.includes("australia")) {
        payGroup = "AUSMonthly";
    }
    return payGroup;
}

/**
 * Recursively removes empty properties from an object or array.
 *
 * An "empty" property is defined as:
 * - `undefined`
 * - `null`
 * - an empty string (`""`)
 * - an empty array (`[]`)
 * - an empty object (`{}`)
 *
 * Arrays are preserved but filtered to remove empty or invalid entries.
 * Objects are returned with only non-empty properties.
 *
 * @function
 * @param {any} obj - The input object or array to be cleaned.
 * @returns {any} - A new object or array with all empty properties removed.
 *
 * @example
 * removeEmptyProperties({
 *   name: "Alice",
 *   age: null,
 *   address: {
 *     street: "",
 *     city: "NYC"
 *   },
 *   preferences: {}
 * });
 * // Returns:
 * // {
 * //   name: "Alice",
 * //   address: {
 * //     city: "NYC"
 * //   }
 * // }
 */
const removeEmptyProperties = (obj) => {
    if (Array.isArray(obj)) {
        return obj
            .map(removeEmptyProperties)
            .filter((item) => item !== undefined && item !== null && !(typeof item === 'object' && Object.keys(item).length === 0));
    }

    if (typeof obj === 'object' && obj !== null) {
        const newObj = {};
        Object.entries(obj).forEach(([key, value]) => {
            const cleanedValue = removeEmptyProperties(value);
            const isEmptyObject = typeof cleanedValue === 'object' && cleanedValue !== null && Object.keys(cleanedValue).length === 0;
            if (
                cleanedValue !== undefined &&
                cleanedValue !== null &&
                cleanedValue !== '' &&
                !(Array.isArray(cleanedValue) && cleanedValue.length === 0) &&
                !isEmptyObject
            ) {
                newObj[key] = cleanedValue;
            }
        });
        return newObj;
    }

    return obj;
};

/**
 * Formats an email template by dynamically replacing placeholders with actual values,
 * and cleaning up spacing and formatting issues in the resulting text.
 *
 * Placeholders in the template should be in the format `${key}`. If a key is missing
 * or its value is `null`/`undefined`, it will be replaced with an empty string.
 *
 * After replacements, the function also:
 * - Fixes spacing and formatting artifacts left by removed or empty values
 * - Normalizes excessive white space
 * - Ensures proper paragraph breaks
 *
 * @function formatEmail
 *
 * @param {string} template - The raw email template string containing placeholders.
 * @param {Object} [placeholders={}] - A key-value map of placeholder names to replacement values.
 *
 * @returns {string} formattedEmail - The cleaned, formatted email string with all placeholders resolved.
 *
 * @example
 * const template = \"Hello ${firstName},\\n\\nYour start date is ${startDate}.\\n\\nThanks!\";\n * const data = { firstName: \"Alex\", startDate: \"April 1\" };\n * const result = formatEmail(template, data);\n * console.log(result);\n * // \"Hello Alex,\\n\\nYour start date is April 1.\\n\\nThanks!\"\n *\n * @note\n * If you want to return HTML instead of plain text, you can uncomment the HTML paragraph wrapping logic at the bottom.
 */
function formatEmail(template, placeholders = {}) {
    let formattedEmail = template;

    // Replace placeholders dynamically, handling missing or null values
    formattedEmail = formattedEmail.replace(/\$\{\s*(\w+)\s*\}/g, (match, key) => {
        return placeholders[key] !== undefined && placeholders[key] !== null ? placeholders[key] : "";
    });

    //Fix spacing issues:
    formattedEmail = formattedEmail
        .replace(/\n\s*\n/g, "\n\n")  // Ensure proper paragraph breaks
        .replace(/\s*:\s+\n/g, ":\n") // Fix cases where placeholders were removed after colons
        .replace(/\s{2,}/g, " ") // Remove excessive spaces
        .replace(/\n{2,}/g, "\n\n") // Ensure double new lines for paragraphs
        .trim(); // Remove trailing spaces

    // // Convert text-based line breaks to HTML paragraph `<p>` tags for proper email formatting
    // formattedEmail = formattedEmail
    // .split("\n") // Split content by new lines
    // .filter(line => line.trim() !== "") // Remove empty lines
    // .map(line => `<p>${line.trim()}</p>`) // Wrap each line in <p> tags
    // .join("\n"); // Rejoin with line breaks


    return formattedEmail;
}
/**
 * Recursively flattens a deeply nested object into a single-level object.
 * Keys from nested structures are concatenated using underscores, and array elements are indexed.
 *
 * Supports:
 * - Nested objects
 * - Arrays of objects or primitive values
 *
 * @function flattenObject
 *
 * @param {Object} obj - The input object to be flattened.
 * @param {string} [prefix=''] - A prefix used for building flattened keys (used internally during recursion).
 * @param {Object} [result={}] - The accumulator object that stores the flattened result (used internally).
 *
 * @returns {Object} result - A single-level object where nested properties are flattened into key paths.
 *
 * @example
 * const nested = {
 *   user: {
 *     name: 'Alice',
 *     address: {
 *       city: 'Wonderland',
 *       zip: '12345'
 *     },
 *     phones: ['123-4567', '987-6543']
 *   }
 * };
 *
 * const flat = flattenObject(nested);
 * console.log(flat);
 * // {
 * //   user_name: 'Alice',
 * //   user_address_city: 'Wonderland',
 * //   user_address_zip: '12345',
 * //   user_phones_0: '123-4567',
 * //   user_phones_1: '987-6543'
 * // }
 */
function flattenObject(obj, prefix = '', result = {}) {
    for (let key in obj) {
        if (Array.isArray(obj[key])) {
            obj[key].forEach((item, index) => {
                if (typeof item === 'object') {
                    flattenObject(item, `${prefix}${key}_${index}_`, result);
                } else {
                    result[`${prefix}${key}_${index}`] = item;
                }
            });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            flattenObject(obj[key], `${prefix}${key}_`, result);
        } else {
            result[`${prefix}${key}`] = obj[key];
        }
    }
    return result;
}

/**
 * Converts an array of objects into a CSV-formatted string.
 * Nested objects and arrays within each object are flattened using `flattenObject`
 * to ensure all values are serialized at a single level.
 *
 * @function generateCSV
 *
 * @param {Object[]} dataArray - An array of objects to be converted into CSV.
 * @returns {string} CSV string representation of the input data.
 *
 * @description
 * - Each object in the array is first flattened to a single-level object.
 * - A unified list of headers is generated from all unique keys across all objects.
 * - Missing or undefined values are represented as empty strings.
 * - Each row in the output CSV corresponds to one flattened object.
 * - Values are wrapped in double quotes to preserve formatting and commas.
 *
 * @example
 * const data = [
 *   { name: 'Alice', details: { age: 30, city: 'Wonderland' } },
 *   { name: 'Bob', details: { age: 25, city: 'Atlantis' } }
 * ];
 *
 * const csv = generateCSV(data);
 * console.log(csv);
 * // Output:
 * // name,details_age,details_city
 * // "Alice","30","Wonderland"
 * // "Bob","25","Atlantis"
 *
 * @requires flattenObject - Assumes `flattenObject(obj)` is available in scope to flatten nested structures.
 */
function generateCSV(dataArray) {
    const flatDataArray = dataArray.map(obj => flattenObject(obj));
    const rawHeaders = Array.from(new Set(flatDataArray.flatMap(obj => Object.keys(obj))));

    const headers = rawHeaders.map(key => {
        const parts = key.split('_');
        const filtered = parts.filter(p => !/^\[\d+\]$/.test(p) && p !== String(parseInt(p))); // remove array indexes
        const lastTwo = filtered.slice(-2);
        return lastTwo.join('_') || key;
    });

    const csvRows = [
        headers.join(','),
        ...flatDataArray.map(row =>
            rawHeaders.map(header => `"${row[header] || ''}"`).join(',')
        )
    ];

    return csvRows.join('\n');
}

/**
 * Formats a raw Dayforce error JSON string into a readable message string.
 *
 * This function parses the Dayforce error response, removes duplicate error messages,
 * and transforms error codes into human-readable labels (e.g., `HR_INVALID_FIELD` → `Invalid Field`).
 * It returns a clean error message string that includes the request ID and all unique error messages.
 *
 * @function formatDayforceError
 * @param {string} errorJson - The raw JSON string returned by Dayforce error response.
 * @returns {string} A formatted, readable string summarizing the error(s).
 *
 * @example
 * const formattedError = formatDayforceError(response.error);
 * console.log(formattedError);
 *
 * // Output:
 * // Error
 * // Request ID: 12345-abc
 * // Invalid Field: Email is required
 * // Unauthorized Access: User does not have permission
 */
function formatDayforceError(errorJson) {
  const parsedError = JSON.parse(errorJson);
  const seen = new Set();
  let output = `Error\nRequest ID: ${parsedError.requestId}`;

  parsedError.processResults.forEach(result => {
    const key = `${result.code}|${result.message}`;
    if (!seen.has(key)) {
      seen.add(key);
      const label = result.code
        .replace(/^HR_/, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

      output += `\n${label}: ${result.message}`;
    }
  });

  return output;
}

/**
 * Writes the mapped destination user to Dayforce using the createRawEmployee API.
 *
 * This function handles user creation, success logging, operational logging, CSV generation,
 * and email notifications based on success or failure. On success, it logs employee details,
 * writes to the operational search index if enabled, and sends a notification email. On failure,
 * it logs the error, formats it, writes failure details to ops search, generates a failure CSV,
 * and sends a failure notification email if configured.
 *
 * @async
 * @function destionWriteFunction
 * @param {Object} destinationUser - The user object mapped from the source system to be created in Dayforce.
 * @returns {Promise<void>}
 *
 * @throws Will not throw errors but logs and handles them internally.
 *
 * @example
 * await destionWriteFunction(mappedUser);
 */
async function destionWriteFunction(destinationUser) {
    let createdUser = await dayforceCallAPI("createRawEmployee", destinationUser);
    if (createdUser?.Data) {
        const employeeXRefCode = createdUser?.Data?.XRefCode;
        log.info(`--------------------Employe Onbording---------------------`);
        log.info(`Employee Onboarded with 
                        EmployeeNumber : ${employeeXRefCode},
                        FirstName : ${destinationUser?.FirstName},
                        LastName : ${destinationUser?.LastName}`);
        if (writeOpsSearch) {
            let objectToSendForOPS = {
                greenhouseCandidate: removeEmptyProperties(request),
                dayforceEmployee: removeEmptyProperties(destinationUser),
                timestamp: new Date().toISOString(),
                statusCode: createdUser?.statusCode,
                operation: "CREATE",
                status: "SUCCESS"
            };
            log.info(`---------before writing into ops serach-----------  ${JSON.stringify(objectToSendForOPS)}`);
            let resultOfOPSSearch = await opsSearch.write("Greenhouse_To_Dayforce_Employees", objectToSendForOPS);
            log.info(`----------------after ops serach write value------------`);
            log.info(`resultOfOPSSearch ${resultOfOPSSearch}`);
        }
        if (isGenerateCSV) {
            // Convert data to array (if not already);
            destinationUser.operation = "Create";
            destinationUser.status = "success";
            const dataArray = Array.isArray(destinationUser) ? destinationUser : [destinationUser];

            // Generate CSV content
            const csvContent = generateCSV(dataArray);
            log.info(`-------------------------generate CSV-------------------------`);
            log.info(`geneare csv conetnt ${csvContent}`);
            utils.writeIntegrationReport(csvContent);
        }
        if (isSendMail) {
            const subject = `New Employee, ${destinationUser?.FirstName}, created.`;
            let body = `A new Employee has been created inside ${appName} with the below details. 
                        name: ${destinationUser?.FirstName} ${destinationUser?.LastName},
                        EmployeeNumber: employeeXRefCode.`;
            body = formatEmail(body, {});
            log.info(`Email Body: ${JSON.stringify(body)}`);
            // Attempt to send email
            const emailToSend = Array.isArray(adminEmail) ? adminEmail.join(",") : adminEmail;
            log.info(`Sending user creation email to ${emailToSend} for ${appName}`);
            const emailResponse = await utils.sendEmail(emailToSend, subject, body);
            log.info(`Admin email notification sent successfully.`);
        }
        let params = {
            xRefCode:employeeXRefCode
        }
        let employeeDetails = dayforce.getEmployeesByXrefCode(params);
        log.info(`successfully created the employee with details ${JSON.stringify(employeeDetails)}`);
    }
    else {
        log.info(`Employee creation failed with dayforce api error  : ${JSON.stringify(createdUser?.error)}`);
        const dayforceError = formatDayforceError(createdUser?.error);
        log.info(`Employee creation failed with error after formatting : ${dayforceError}`);
        if (writeOpsSearch) {
            let objectToSendForOPS = {
                greenhouseCandidate: removeEmptyProperties(request),
                dayforceEmployee: removeEmptyProperties(destinationUser),
                timestamp: new Date().toISOString(),
                operation: "CREATE",
                status: "FAILURE",
                errorDetails: dayforceError
            };
            log.info(`---------before writing into ops serach-----------  ${JSON.stringify(objectToSendForOPS)}`);
            let resultOfOPSSearch = await opsSearch.write("Greenhouse_To_Dayforce_Employees", objectToSendForOPS);
            log.info(`----------------after ops serach write value------------`);
            log.info(`resultOfOPSSearch ${resultOfOPSSearch}`);
        }
        if (isGenerateCSV) {
            destinationUser.operation = "Create";
            destinationUser.status = "failed";
            if(createdUser?.statusCode === "400"){
                destinationUser.errorValue = "User Creation Failed due to invalid payload and mapping.";
            } else{
                destinationUser.errorValue = dayforceError;
            }
            const dataArray = Array.isArray(destinationUser) ? destinationUser : [destinationUser];

            // Generate CSV content
            const csvContent = generateCSV(dataArray);
            log.info(`geneare csv conetnt ${csvContent}`);
            utils.writeIntegrationReport(csvContent);
        }
        if (isSendMail) {
            const subject = `Error in creating a worker in Dayforce`;
            let body = `Onboarding a new worker failed in Dayforce with the error ${dayforceError}. 
                        Fix the errors in the Greenhouse Recruiting app and re-run the integration again.`;
            body = formatEmail(body, {});
            const emailToSend = Array.isArray(adminEmail) ? adminEmail.join(",") : adminEmail;
            const emailResponse = await utils.sendEmail(emailToSend, subject, body);
            log.info(`Sending Employee creation email to ${emailToSend} for ${appName}`);
            log.info(`Admin email notification sent successfully.`);
            log.info(`Employee Creation Failed with payload : ${JSON.stringify(destinationUser)} and error : ${dayforceError}`);
        }
    }
}

/**
 * Validates a nested payload object for missing or empty required fields.
 * 
 * This function checks all fields within the given payload recursively.
 * If any field is `null`, `undefined`, an empty string, or an empty object (`{}`), it is considered missing.
 * If missing fields are found:
 * - An error message is constructed.
 * - An email is optionally sent to the configured admin(s).
 * - An error is thrown so it can be caught by a calling function's `catch` block.
 *
 * @async
 * @function handlePayloadErros
 * @param {Object} payload - The destination user object to validate.
 * @throws {Error} Throws an error with a message listing all missing or invalid fields.
 * @example
 * try {
 *   await handlePayloadErros(userPayload);
 *   // proceed if no error
 * } catch (err) {
 *   console.error("Validation failed:", err.message);
 * }
 */
async function handlePayloadErros(payload) {
  try {
    const missingFields = [];
    const stack = [{ obj: payload, path: "" }];

    while (stack.length > 0) {
      const { obj, path } = stack.pop();

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          stack.push({ obj: item, path: `${path}[${index}]` });
        });
      } else if (typeof obj === "object" && obj !== null) {
        for (let key in obj) {
          const value = obj[key];
          const fullPath = path ? `${path}.${key}` : key;
            if (
                value === null ||
                value === undefined ||
                value === "" ||
                (typeof value === "object" &&
                    !Array.isArray(value) &&
                    Object.keys(value).length === 0)
            ) {
                missingFields.push(fullPath);
            } else if (typeof value === "object") {
            stack.push({ obj: value, path: fullPath });
          }
        }
      }
    }

    if (missingFields.length > 0) {
      const dayforceError = `Missing or empty required fields: ${missingFields.join(", ")}`;

      if (isSendMail) {
        const subject = `Error in creating a worker in Dayforce`;
        let body = `Onboarding a new worker failed in Dayforce with the error: ${dayforceError}. 
                    Fix the errors in the Greenhouse Recruiting app and re-run the integration again.`;
        body = formatEmail(body, {});
        const emailToSend = Array.isArray(adminEmail) ? adminEmail.join(",") : adminEmail;
        const emailResponse = await utils.sendEmail(emailToSend, subject, body);
        log.info(`Sending Employee creation email to ${emailToSend} for ${appName}`);
        log.info(`Admin email notification sent successfully.`);
        log.info(`Employee Creation Failed with payload : ${JSON.stringify(payload)} and error : ${dayforceError}`);
      }

      throw new Error(dayforceError);
    }
  } catch (error) {
    return error;
  }
}

/**
 * Main entry point for processing the webhook event and creating a user in the destination system.
 *
 * This function logs the webhook event, prepares the `destinationUser` object using mapping logic,
 * validates the resulting payload, and either sends it to the destination system or logs it based on `reportOnly`.
 * If any errors occur, they are caught, logged, and re-thrown for upstream handling.
 *
 * @async
 * @function main
 * @param {Object} meta - Metadata or context object passed into the function (currently unused but available for future use).
 * @throws {Error} Throws an error if mapping, validation, or writing fails.
 * @example
 * try {
 *   await main({});
 * } catch (error) {
 *   console.error("Execution failed:", error);
 * }
 */
async function main() {
    try {
        log.info(`
================ Integration Execution Started ================
Integration Name   : ${integrationName}
Run ID             : ${RUN_ID}
Orchestration ID   : ${ORCH_ID}
Orchestration Name : ${ORCH_NAME}
Log ID             : ${LOG_ID}
Timestamp          : ${TIMESTAMP}
===============================================================`);


        const prefs = {
            "Integration": integrationName,
            "Recipient Email Ids": adminEmail,
            "Send Email Notifications": isSendMail,
            "Report Only Mode": reportOnly,
            "Generate CSV Report": isGenerateCSV,
            "Enable OpenSearch Logs": writeOpsSearch,
            "Enable Debug Mode": isDebugMode,
            "New Employee Role": newEmployeeRoles,
            "Department Location XrefCode" : departmentLocationXrefCode,
            "Employee Gender" : JSON.stringify(employeeGender),
            "Dayforce Employee Prefred Language": dayforceCultureValue
        };
        printPreferences(prefs); 
        log.info(`webhook event: ${JSON.stringify(request)}`);

        let destinationUser = {};

        // preparing the attribute mapping
        await mapSourceToDestination(request, destinationUser);
        //handle payload not mapped error sceniores??
        await handlePayloadErros(destinationUser);
        log.info(`destination payload after mapping ${JSON.stringify(destinationUser)}`);

        if (!reportOnly) {
            await destionWriteFunction(destinationUser);
        } else {
            log.info(`Employee will get created with payload ${JSON.stringify(destinationUser)}`);
        }

        log.info(`script ended`);

    } catch (error) {
        log.info(`error plain: ${error}\njson stringified: ${JSON.stringify(error)}`)
        if (typeof error === "object") {
            error = JSON.stringify(error);
        }
        throw new Error(error);
    }
};

await main();