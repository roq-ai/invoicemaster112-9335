import AppLayout from 'layout/app-layout';
import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Box,
  Spinner,
  FormErrorMessage,
  Switch,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberInputField,
  NumberIncrementStepper,
  NumberInput,
} from '@chakra-ui/react';
import { useFormik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import { useRouter } from 'next/router';
import { createReport } from 'apiSdk/reports';
import { Error } from 'components/error';
import { reportValidationSchema } from 'validationSchema/reports';
import { AsyncSelect } from 'components/async-select';
import { ArrayFormField } from 'components/array-form-field';
import { AccessOperationEnum, AccessServiceEnum, withAuthorization } from '@roq/nextjs';
import { OrganisationInterface } from 'interfaces/organisation';
import { UserInterface } from 'interfaces/user';
import { getOrganisations } from 'apiSdk/organisations';
import { getUsers } from 'apiSdk/users';
import { ReportInterface } from 'interfaces/report';

function ReportCreatePage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  const handleSubmit = async (values: ReportInterface, { resetForm }: FormikHelpers<any>) => {
    setError(null);
    try {
      await createReport(values);
      resetForm();
    } catch (error) {
      setError(error);
    }
  };

  const formik = useFormik<ReportInterface>({
    initialValues: {
      report_name: '',
      report_type: '',
      report_date: new Date(new Date().toDateString()),
      organisation_id: (router.query.organisation_id as string) ?? null,
      user_id: (router.query.user_id as string) ?? null,
    },
    validationSchema: reportValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  return (
    <AppLayout>
      <Text as="h1" fontSize="2xl" fontWeight="bold">
        Create Report
      </Text>
      <Box bg="white" p={4} rounded="md" shadow="md">
        {error && <Error error={error} />}
        <form onSubmit={formik.handleSubmit}>
          <FormControl id="report_name" mb="4" isInvalid={!!formik.errors?.report_name}>
            <FormLabel>Report Name</FormLabel>
            <Input type="text" name="report_name" value={formik.values?.report_name} onChange={formik.handleChange} />
            {formik.errors.report_name && <FormErrorMessage>{formik.errors?.report_name}</FormErrorMessage>}
          </FormControl>
          <FormControl id="report_type" mb="4" isInvalid={!!formik.errors?.report_type}>
            <FormLabel>Report Type</FormLabel>
            <Input type="text" name="report_type" value={formik.values?.report_type} onChange={formik.handleChange} />
            {formik.errors.report_type && <FormErrorMessage>{formik.errors?.report_type}</FormErrorMessage>}
          </FormControl>
          <FormControl id="report_date" mb="4">
            <FormLabel>Report Date</FormLabel>
            <DatePicker
              dateFormat={'dd/MM/yyyy'}
              selected={formik.values?.report_date}
              onChange={(value: Date) => formik.setFieldValue('report_date', value)}
            />
          </FormControl>
          <AsyncSelect<OrganisationInterface>
            formik={formik}
            name={'organisation_id'}
            label={'Select Organisation'}
            placeholder={'Select Organisation'}
            fetcher={getOrganisations}
            renderOption={(record) => (
              <option key={record.id} value={record.id}>
                {record?.name}
              </option>
            )}
          />
          <AsyncSelect<UserInterface>
            formik={formik}
            name={'user_id'}
            label={'Select User'}
            placeholder={'Select User'}
            fetcher={getUsers}
            renderOption={(record) => (
              <option key={record.id} value={record.id}>
                {record?.email}
              </option>
            )}
          />
          <Button isDisabled={!formik.isValid || formik?.isSubmitting} colorScheme="blue" type="submit" mr="4">
            Submit
          </Button>
        </form>
      </Box>
    </AppLayout>
  );
}

export default withAuthorization({
  service: AccessServiceEnum.PROJECT,
  entity: 'report',
  operation: AccessOperationEnum.CREATE,
})(ReportCreatePage);
