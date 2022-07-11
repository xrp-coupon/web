import { useEffect, useContext } from "react";
import {
	Box,
  Heading,
  ButtonGroup,
  Text,
  Button,
  Container,
	useToast,
	Code,
	Divider
} from '@chakra-ui/react';
import useScriptsStore from "../../store/scripts";
import { ShopContext } from "../../context";
import { INTERNAL_SERVER_ERROR } from "../../constants/strings";
import NavBar from "../../components/navbar";


const SettingsRoute = () => {
	const shop = useContext(ShopContext);
	const scripts = useScriptsStore((state) => state.scripts);
  const postScripts = useScriptsStore((state) => state.postScripts);
	const getScripts = useScriptsStore((state) => state.getScripts);
	const destroyScripts = useScriptsStore((state) => state.destroyScripts);
	const toast = useToast();


	useEffect(() => {
		getScripts(shop);
	}, []);

	const enableWidget = async () => {
		try {
			await postScripts(shop);
			toast({
				title: `Widget added successfully! Please visit your online store after 30 seconds to check the widget.`,
				status: 'success'
			});
			getScripts(shop)
		} catch (e) {
			toast({
				title: e.message || INTERNAL_SERVER_ERROR,
				status: 'error'
			})
		}
	}

	const disableWidget = async () => {
		try {
			await destroyScripts(shop);
			toast({
				title: `Widget removed successfully!`,
				status: 'success'
			});
			getScripts(shop)

		} catch (e) {
			toast({
				title: e.message || INTERNAL_SERVER_ERROR,
				status: 'error'
			})
		}
	}


	const renderButton = () => {
		if (scripts.get.loading) {
			return <Button colorScheme="gray" isLoading isDisabled>Loading ...</Button>
		} else if (scripts.get.success.data.length) {
			return (
				<Button
					isLoading={scripts.destroy.loading || scripts.get.loading}
					fontWeight="bold"
					size="lg"
					colorScheme="red"
					onClick={disableWidget}
				>
					Remove Widget From Your Store
				</Button>
			)
		} else {
			return (
				<Button
					isLoading={scripts.post.loading || scripts.get.loading}
					fontWeight="bold"
					size="lg"
					colorScheme='blue'
					onClick={enableWidget}
				>
					Add Widget To Your Store
				</Button>
			)
		}
	}
	
	return  (
		<>
		<NavBar />
		<Container maxW={'7xl'} p="12">
			<Box as="section">
				<Box
					maxW="2xl"
					mx="auto"
					px={{ base: '6', lg: '8' }}
					py={{ base: '16', sm: '20' }}
					textAlign="center"
				>
					<Heading size="3xl" fontWeight="extrabold" letterSpacing="tight">
						Widget embed settings
					</Heading>
					<Text mt="4" fontSize="lg">
						Enable or disable "Shop the look" widget on your store. The widget gets appended to the bottom of your store page above the
						footer on the home page.
					</Text>
					<ButtonGroup mt="8" variant='outline' spacing='6'>
						{renderButton()}
					</ButtonGroup>

					<br />
					<br />
					<Divider />
					<Text mt="4" fontSize="lg">
						NOTE: If you want the widget only on certain pages or only in certain positions please add the following html tag to custom liquid or custom html section.
					</Text>

					<br />
					<Code children={`<div id="frangout-shop-look-app"> </div>`}></Code>
				
				</Box>
			</Box>
		</Container>
		</>
	)

}

export default SettingsRoute;